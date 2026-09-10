import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import { inMemoryStore } from '../config/seedData.js';

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
export const getSkills = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const skills = await Skill.find().sort({ category: 1, name: 1 });
      return res.status(200).json({
        success: true,
        count: skills.length,
        data: skills,
      });
    }

    // In-memory fallback
    res.status(200).json({
      success: true,
      count: inMemoryStore.skills.length,
      data: inMemoryStore.skills,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving skills.',
    });
  }
};
