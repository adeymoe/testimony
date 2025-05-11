import mongoose from "mongoose";

const testimonySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    religion: {
      type: String,
      enum: ['Christianity', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Other'],
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId], // emoji -> array of User IDs
      default: {},
    },

    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['image', 'video', 'audio'],
          required: true,
        },
      }
    ],
  },
  { timestamps: true, minimize: false }
);

const testimonyModel = mongoose.models.Testimony || mongoose.model('Testimony', testimonySchema);
export default testimonyModel;
