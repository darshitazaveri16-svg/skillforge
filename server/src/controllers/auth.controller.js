import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Career from '../models/Career.js';
import { inMemoryStore } from '../config/seedData.js';

// Fallback in-memory users list for offline execution
export const inMemoryUsers = [];

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

    const formattedEmail = email.toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existingUser = await User.findOne({ email: formattedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: formattedEmail,
        password: hashedPassword,
        targetCareer: targetCareer || 'Full Stack Developer',
        role: role === 'admin' ? 'admin' : 'student',
      });

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          targetCareer: user.targetCareer,
          createdAt: user.createdAt,
        },
      });
    }

    // In-memory fallback mode
    const existingMemoryUser = inMemoryUsers.find((u) => u.email === formattedEmail);
    if (existingMemoryUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const memUser = {
      _id: `usr_${Date.now()}`,
      id: `usr_${Date.now()}`,
      name,
      email: formattedEmail,
      password: hashedPassword,
      targetCareer: targetCareer || 'Full Stack Developer',
      role: role === 'admin' ? 'admin' : 'student',
      createdAt: new Date(),
    };

    inMemoryUsers.push(memUser);
    const token = generateToken(memUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: memUser._id,
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        targetCareer: memUser.targetCareer,
        createdAt: memUser.createdAt,
      },
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

    const formattedEmail = email.toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: formattedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          targetCareer: user.targetCareer,
          createdAt: user.createdAt,
        },
      });
    }

    // In-memory fallback
    const memUser = inMemoryUsers.find((u) => u.email === formattedEmail);
    if (!memUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, memUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(memUser);
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: memUser._id,
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        targetCareer: memUser.targetCareer,
        createdAt: memUser.createdAt,
      },
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
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && req.user._id) {
      const fullUser = await User.findById(req.user._id)
        .select('-password')
        .populate({
          path: 'targetCareerRef',
          populate: { path: 'requiredSkills.skill' },
        });

      if (fullUser) {
        return res.status(200).json({
          success: true,
          user: fullUser,
        });
      }
    }

    // In-memory fallback lookup
    const memUser = inMemoryUsers.find(
      (u) => u._id === req.user._id || u.id === req.user.id || u.email === req.user.email
    );

    res.status(200).json({
      success: true,
      user: memUser || req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile.',
    });
  }
};

// @desc    Update student target career
// @route   PUT /api/auth/profile/career
// @access  Private
export const updateTargetCareer = async (req, res) => {
  try {
    const { careerId, careerName } = req.body;

    if (!careerId && !careerName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid careerId or careerName.',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let targetCareerDoc;
      if (careerId && mongoose.Types.ObjectId.isValid(careerId)) {
        targetCareerDoc = await Career.findById(careerId).populate('requiredSkills.skill');
      } else if (careerName) {
        targetCareerDoc = await Career.findOne({ name: careerName }).populate('requiredSkills.skill');
      } else if (careerId) {
        targetCareerDoc = await Career.findOne({ name: careerId }).populate('requiredSkills.skill');
      }

      if (!targetCareerDoc) {
        return res.status(404).json({
          success: false,
          message: 'Specified career does not exist.',
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          targetCareer: targetCareerDoc.name,
          targetCareerRef: targetCareerDoc._id,
        },
        { new: true }
      ).populate({
        path: 'targetCareerRef',
        populate: { path: 'requiredSkills.skill' },
      });

      return res.status(200).json({
        success: true,
        message: `Target career updated to ${targetCareerDoc.name}`,
        user: updatedUser,
      });
    }

    // In-memory fallback
    const careerObj = inMemoryStore.careers.find(
      (c) => c._id === careerId || c.id === careerId || c.name === careerName || c.name === careerId
    );

    if (!careerObj) {
      return res.status(404).json({
        success: false,
        message: 'Specified career does not exist in memory store.',
      });
    }

    const memUser = inMemoryUsers.find(
      (u) => u._id === req.user._id || u.id === req.user.id || u.email === req.user.email
    );

    if (memUser) {
      memUser.targetCareer = careerObj.name;
      memUser.targetCareerRef = careerObj;
    }

    req.user.targetCareer = careerObj.name;
    req.user.targetCareerRef = careerObj;

    res.status(200).json({
      success: true,
      message: `Target career updated to ${careerObj.name}`,
      user: memUser || req.user,
    });
  } catch (error) {
    console.error('Error updating target career:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating target career.',
    });
  }
};
