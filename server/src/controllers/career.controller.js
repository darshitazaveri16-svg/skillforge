import mongoose from 'mongoose';
import Career from '../models/Career.js';
import { inMemoryStore } from '../config/seedData.js';

// @desc    Get all careers
// @route   GET /api/careers
// @access  Public
export const getCareers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const careers = await Career.find().populate('requiredSkills.skill');
      return res.status(200).json({
        success: true,
        count: careers.length,
        data: careers,
      });
    }

    // In-memory fallback
    res.status(200).json({
      success: true,
      count: inMemoryStore.careers.length,
      data: inMemoryStore.careers,
    });
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving careers.',
    });
  }
};

// @desc    Get career by ID
// @route   GET /api/careers/:id
// @access  Public
export const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid career ID format.',
        });
      }

      const career = await Career.findById(id).populate('requiredSkills.skill');
      if (!career) {
        return res.status(404).json({
          success: false,
          message: 'Career not found.',
        });
      }

      return res.status(200).json({
        success: true,
        data: career,
      });
    }

    // In-memory fallback lookup
    const career = inMemoryStore.careers.find((c) => c._id === id || c.id === id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: career,
    });
  } catch (error) {
    console.error('Error fetching career by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving career details.',
    });
  }
};

// @desc    Get required skills for a career by ID
// @route   GET /api/careers/:id/skills
// @access  Public
export const getCareerSkills = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid career ID format.',
        });
      }

      const career = await Career.findById(id).populate('requiredSkills.skill');
      if (!career) {
        return res.status(404).json({
          success: false,
          message: 'Career not found.',
        });
      }

      return res.status(200).json({
        success: true,
        careerName: career.name,
        count: career.requiredSkills.length,
        data: career.requiredSkills,
      });
    }

    // In-memory fallback
    const career = inMemoryStore.careers.find((c) => c._id === id || c.id === id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found.',
      });
    }

    res.status(200).json({
      success: true,
      careerName: career.name,
      count: career.requiredSkills.length,
      data: career.requiredSkills,
    });
  } catch (error) {
    console.error('Error fetching career skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving career skills.',
    });
  }
};
