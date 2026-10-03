import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const generateToken = (userId: mongoose.Types.ObjectId): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign({ id: userId.toString() }, jwtSecret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const sanitizeUser = (user: any) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  return userObj;
};
