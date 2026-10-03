import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { sanitizeUser } from '../utils/jwt';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body;
    const userId = req.user!._id;

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        throw new ApiError('Current password is required to set a new password', 400);
      }
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        throw new ApiError('Current password is incorrect', 401);
      }
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};
