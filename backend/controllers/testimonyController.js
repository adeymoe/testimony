import { v2 as cloudinary } from "cloudinary";
import testimonyModel from "../models/testimonyModel.js";

const createTestimony = async (req, res) => {
  try {
    const { title, religion, body } = req.body;
    const userId = req.user._id;

    if (!userId || !body || !religion) {
      return res.status(400).json({ success: false, message: "Missing required fields (user, religion, or body)" });
    }

    const mediaFiles = req.files?.media || [];
    const uploadedMedia = await Promise.all(
      mediaFiles.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });

        let type = "image";
        if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype.startsWith("audio")) type = "audio";

        return { url: result.secure_url, type };
      })
    );

    const newTestimony = new testimonyModel({
      user: userId,
      title,
      religion,
      body,
      media: uploadedMedia,
    });

    await newTestimony.save();
    res.json({ success: true, message: "Testimony created successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTestimony = async (req, res) => {
  try {
    const currentUserId = req.user?._id?.toString();
    const { page = 1, limit = 10, religion = 'All', sort = 'latest' } = req.query;

    const query = {};
    if (religion !== 'All' && religion !== 'Trending') {
      query.religion = religion;
    }

    const testimonies = await testimonyModel
      .find(query)
      .select('-__v')
      .sort({ createdAt: -1 }) // temporary sort
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'username avatar')
      .lean();

    const formatted = testimonies.map(testimony => {
      const { reactions, userReaction } = formatReactions(testimony.reactions || {}, currentUserId);
      return {
        ...testimony,
        reactions,
        userReaction,
        reactionCount: Object.values(testimony.reactions || {}).reduce((sum, arr) => sum + arr.length, 0),
      };
    });

    // If sort is trending, sort by reaction count descending
    if (sort === 'trending') {
      formatted.sort((a, b) => b.reactionCount - a.reactionCount);
    }

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch testimonies' });
  }
};


const getMyTestimonies = async (req, res) => {
  try {
    const testimonies = await testimonyModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = testimonies.map(testimony => {
      const { reactions, userReaction } = formatReactions(testimony.reactions || {}, req.user._id.toString());
      return {
        ...testimony,
        reactions,
        userReaction,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your testimonies.' });
  }
};

const getLikedTestimonies = async (req, res) => {
  try {
    const testimonies = await testimonyModel
      .find({ likes: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = testimonies.map(testimony => {
      const { reactions, userReaction } = formatReactions(testimony.reactions || {}, req.user._id.toString());
      return {
        ...testimony,
        reactions,
        userReaction,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch liked testimonies.' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const testimony = await testimonyModel.findById(req.params.id);
    if (!testimony) return res.status(404).json({ success: false, message: 'Testimony not found.' });

    const userId = req.user._id.toString();
    const liked = testimony.likes.includes(userId);

    if (liked) {
      testimony.likes = testimony.likes.filter(id => id.toString() !== userId);
    } else {
      testimony.likes.push(userId);
    }

    await testimony.save();
    res.json({ success: true, liked: !liked, totalLikes: testimony.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
};

const toggleReact = async (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id.toString();

  try {
    const testimony = await testimonyModel.findById(id);
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Testimony not found" });
    }

    // 1) Normalize whatever is in testimony.reactions into a plain object of arrays
    const raw = testimony.reactions instanceof Map
      ? Object.fromEntries(testimony.reactions)
      : (testimony.reactions || {});
    const reactionsObj = {};
    for (const [key, val] of Object.entries(raw)) {
      // ensure every entry is an array
      reactionsObj[key] = Array.isArray(val) ? [...val] : [val];
    }

    // 2) Toggle only the clicked emoji
    const usersFor = reactionsObj[emoji] || [];
    if (usersFor.includes(userId)) {
      // remove you
      const filtered = usersFor.filter(u => u !== userId);
      if (filtered.length) reactionsObj[emoji] = filtered;
      else delete reactionsObj[emoji];
    } else {
      // add you
      reactionsObj[emoji] = usersFor.concat(userId);
    }

    // 3) Convert back into a Map for Mongoose
    const map = new Map();
    for (const [e, arr] of Object.entries(reactionsObj)) {
      map.set(e, arr);
    }
    testimony.reactions = map;

    await testimony.save();

    // 4) Build the response payload
    const formatted = {};
    let userReaction = null;
    for (const [e, arr] of map.entries()) {
      formatted[e] = arr.length;
      if (arr.includes(userId)) userReaction = e;
    }

    return res.json({ success: true, reactions: formatted, userReaction });
  } catch (err) {
    console.error("toggleReact error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

function formatReactions(reactionsMap, currentUserId) {
  const formatted = {};
  let userReaction = null;

  for (const [emoji, userIds] of Object.entries(reactionsMap)) {
    formatted[emoji] = userIds.length;
    if (userIds.includes(currentUserId)) {
      userReaction = emoji;
    }
  }

  return { reactions: formatted, userReaction };
}

export {
  createTestimony,
  getAllTestimony,
  getLikedTestimonies,
  getMyTestimonies,
  toggleLike,
  toggleReact
};
