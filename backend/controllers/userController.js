import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const getUser = async (req, res) => {
  try {
    const { password, ...safeUser } = req.user.toObject();
    res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If Multer saw a file, it’ll be on req.file
    if (req.file) {
      // upload to Cloudinary
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: 'avatars',
        resource_type: 'image'
      });
      user.avatar = upload.secure_url;
    }

    // Update fields if provided
    user.fullName = name     || user.fullName;
    user.username = username || user.username;
    user.bio      = bio      || user.bio;

    await user.save();
    const { password, ...safeUser } = user.toObject();
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Please provide email and password" });
    }

    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid email or password" });

    const token = createToken(user._id);
    const { password: _, ...safeUser } = user.toObject();

    res.json({ success: true, token, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.json({ success: false, message: "Please fill all fields" });
    }

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ fullName, username, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    const { password: _, ...safeUser } = user.toObject();

    res.json({ success: true, token, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  getUser,
  updateUser,
  getUserProfile
};
