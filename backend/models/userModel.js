import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    bio: { type: String, default: '', trim: true },
    avatar: { type: String, default: '' },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Testimony' }]
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;
