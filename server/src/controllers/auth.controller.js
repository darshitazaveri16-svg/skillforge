import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'skillforge_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'student',
    },
    secret,
    { expiresIn }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, targetCareer, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } catch (err) {
      console.warn('[DB Warning] MongoDB check fallback:', err.message);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Hash Password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    let user;
    try {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        targetCareer: targetCareer || 'Full Stack Developer',
        role: role === 'admin' ? 'admin' : 'student',
      });
    } catch (err) {
      // In case DB is not running, return error
      return res.status(500).json({
        success: false,
        message: 'Database error creating user: ' + err.message,
      });
    }

    const token = generateToken(user);

    // Sanitize output
    const userResponse = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetCareer: user.targetCareer,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and include password field
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error during login: ' + err.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    const userResponse = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetCareer: user.targetCareer,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile.',
    });
  }
};
