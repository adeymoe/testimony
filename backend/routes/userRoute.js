import express from 'express';
import {
  loginUser,
  registerUser,
  getUser,
  updateUser,
  getUserProfile
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);             // Register user
userRouter.post('/login', loginUser);                   // Login user
userRouter.get('/me', authUser, getUser);               // Get current logged-in user's data
userRouter.put('/update', authUser,upload.single('avatar'), updateUser);        // Update current user's profile
userRouter.get('/profile/:id', authUser, getUserProfile); // Get any user profile by ID

export default userRouter;
