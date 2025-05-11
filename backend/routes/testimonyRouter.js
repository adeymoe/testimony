import express from 'express';
import {
  createTestimony,
  getAllTestimony,
  getMyTestimonies,
  getLikedTestimonies,
  toggleLike,
  toggleReact
} from '../controllers/testimonyController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/auth.js';

const testimonyRouter = express.Router();

// Create a new testimony with optional media
testimonyRouter.post(
  '/create',
  authUser,
  upload.fields([{ name: 'media', maxCount: 10 }]),
  createTestimony
);

testimonyRouter.get('/all', getAllTestimony);

testimonyRouter.get('/my-testimonies', authUser, getMyTestimonies);

testimonyRouter.get('/liked-testimonies', authUser, getLikedTestimonies);

testimonyRouter.post('/:id/like', authUser, toggleLike);

testimonyRouter.post('/:id/react', authUser, toggleReact);

export default testimonyRouter;
