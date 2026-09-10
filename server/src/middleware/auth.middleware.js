import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryUsers } from '../controllers/auth.controller.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token missing.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'skillforge_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists.',
        });
      }
      req.user = user;
      return next();
    }

    // Fallback mode: find in memory users store
    const memUser = inMemoryUsers.find(
      (u) => u._id === decoded.id || u.id === decoded.id || u.email === decoded.email
    );

    req.user = memUser || {
      _id: decoded.id,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'student',
      targetCareer: decoded.targetCareer || 'Full Stack Developer',
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token invalid or expired.',
    });
  }
};
