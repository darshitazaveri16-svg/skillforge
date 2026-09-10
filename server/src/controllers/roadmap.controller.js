import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';
import Career from '../models/Career.js';
import AssessmentResult from '../models/AssessmentResult.js';
import { calculateSkillGapAndReadiness } from '../services/skillGap.service.js';
import { generateRoadmapItems } from '../services/roadmap.service.js';
import { inMemoryStore } from '../config/seedData.js';
import { inMemoryAssessmentResults } from './assessment.controller.js';

// Fallback in-memory roadmap store
export const inMemoryRoadmaps = [];

// Helper to calculate progress percentage
const calculateProgress = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const completedCount = items.filter((i) => i.completed).length;
  return Math.round((completedCount / items.length) * 100);
};

// @desc    Get current student's personalized roadmap
// @route   GET /api/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    const user = req.user;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Find existing roadmap
      let roadmap = await Roadmap.findOne({ user: user._id });

      if (roadmap) {
        return res.status(200).json({
          success: true,
          data: roadmap,
        });
      }

      // Auto-generate if no roadmap exists yet
      return generateOrRefreshRoadmap(req, res);
    }

    // In-memory fallback mode
    let memRoadmap = inMemoryRoadmaps.find((r) => r.user === (user._id || user.id));
    if (memRoadmap) {
      return res.status(200).json({
        success: true,
        data: memRoadmap,
      });
    }

    return generateOrRefreshRoadmap(req, res);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving personalized roadmap.',
    });
  }
};

// @desc    Generate or regenerate personalized roadmap using latest Skill Gap Engine analysis
// @route   POST /api/roadmap/generate
// @access  Private
export const generateRoadmapController = async (req, res) => {
  return generateOrRefreshRoadmap(req, res);
};

// Shared helper to perform generation
const generateOrRefreshRoadmap = async (req, res) => {
  try {
    const user = req.user;
    const targetCareerName = user.targetCareer || 'Full Stack Developer';
    const isDbConnected = mongoose.connection.readyState === 1;

    let careerDoc;
    let latestResultDoc;

    if (isDbConnected) {
      if (user.targetCareerRef) {
        careerDoc = await Career.findById(user.targetCareerRef).populate('requiredSkills.skill');
      }
      if (!careerDoc) {
        careerDoc = await Career.findOne({ name: targetCareerName }).populate('requiredSkills.skill');
      }

      if (!careerDoc) {
        return res.status(404).json({
          success: false,
          message: `Target career '${targetCareerName}' not found. Please select a valid target career.`,
        });
      }

      latestResultDoc = await AssessmentResult.findOne({ user: user._id }).sort({ completedAt: -1 });
      if (!latestResultDoc) {
        return res.status(404).json({
          success: false,
          hasAssessment: false,
          message: 'No completed assessment found. Complete an assessment to generate your personalized roadmap.',
        });
      }

      // Execute Skill Gap Engine & Roadmap Generator
      const analysis = calculateSkillGapAndReadiness(careerDoc, latestResultDoc);
      const generatedItems = generateRoadmapItems(analysis.skillAnalysis);

      // Upsert Roadmap document
      const roadmap = await Roadmap.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          career: careerDoc._id,
          careerName: careerDoc.name,
          readinessScore: analysis.readinessScore,
          items: generatedItems,
          progress: 0,
          generatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Personalized learning roadmap generated successfully.',
        data: roadmap,
      });
    }

    // In-memory fallback mode
    careerDoc = inMemoryStore.careers.find(
      (c) => c.name === targetCareerName || c._id === user.targetCareerRef || c.id === user.targetCareerRef
    ) || inMemoryStore.careers[0];

    const userResults = inMemoryAssessmentResults.filter((r) => r.user === (user._id || user.id));
    latestResultDoc = userResults[userResults.length - 1];

    if (!latestResultDoc) {
      return res.status(404).json({
        success: false,
        hasAssessment: false,
        message: 'No completed assessment found. Complete an assessment to generate your personalized roadmap.',
      });
    }

    const analysis = calculateSkillGapAndReadiness(careerDoc, latestResultDoc);
    const generatedItems = generateRoadmapItems(analysis.skillAnalysis);

    let memRoadmap = inMemoryRoadmaps.find((r) => r.user === (user._id || user.id));
    if (memRoadmap) {
      memRoadmap.careerName = careerDoc.name;
      memRoadmap.readinessScore = analysis.readinessScore;
      memRoadmap.items = generatedItems;
      memRoadmap.progress = 0;
      memRoadmap.generatedAt = new Date();
    } else {
      memRoadmap = {
        _id: `rdm_${Date.now()}`,
        id: `rdm_${Date.now()}`,
        user: user._id || user.id,
        career: careerDoc._id,
        careerName: careerDoc.name,
        readinessScore: analysis.readinessScore,
        items: generatedItems,
        progress: 0,
        generatedAt: new Date(),
      };
      inMemoryRoadmaps.push(memRoadmap);
    }

    res.status(200).json({
      success: true,
      message: 'Personalized learning roadmap generated successfully.',
      data: memRoadmap,
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating personalized roadmap.',
    });
  }
};

// @desc    Toggle or update completion status of a roadmap item
// @route   PATCH /api/roadmap/items/:itemId
// @access  Private
export const toggleItemCompletion = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { completed } = req.body;
    const user = req.user;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const roadmap = await Roadmap.findOne({ user: user._id });

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: 'Roadmap not found.',
        });
      }

      const item = roadmap.items.find((i) => i.itemId === itemId || (i._id && i._id.toString() === itemId));

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Roadmap item not found.',
        });
      }

      item.completed = completed !== undefined ? Boolean(completed) : !item.completed;
      roadmap.progress = calculateProgress(roadmap.items);

      await roadmap.save();

      return res.status(200).json({
        success: true,
        message: `Roadmap item status updated to ${item.completed ? 'completed' : 'incomplete'}.`,
        data: roadmap,
      });
    }

    // In-memory fallback mode
    const memRoadmap = inMemoryRoadmaps.find((r) => r.user === (user._id || user.id));
    if (!memRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.',
      });
    }

    const item = memRoadmap.items.find((i) => i.itemId === itemId || i._id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap item not found in memory store.',
      });
    }

    item.completed = completed !== undefined ? Boolean(completed) : !item.completed;
    memRoadmap.progress = calculateProgress(memRoadmap.items);

    res.status(200).json({
      success: true,
      message: `Roadmap item status updated to ${item.completed ? 'completed' : 'incomplete'}.`,
      data: memRoadmap,
    });
  } catch (error) {
    console.error('Error updating roadmap item completion:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating roadmap item.',
    });
  }
};
