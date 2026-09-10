import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

    // Try fetching full user from DB if connected
    let user;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // Fallback if DB is disconnected in mock/offline mode
      user = { _id: decoded.id, id: decoded.id, role: decoded.role, email: decoded.email };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token invalid or expired.',
    });
  }
};
