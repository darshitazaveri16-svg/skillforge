import mongoose from 'mongoose';
import Career from '../models/Career.js';
import AssessmentResult from '../models/AssessmentResult.js';
import { calculateSkillGapAndReadiness } from '../services/skillGap.service.js';
import { inMemoryStore } from '../config/seedData.js';
import { inMemoryAssessmentResults } from './assessment.controller.js';

// @desc    Get career readiness analysis & skill gap breakdown for authenticated student
// @route   GET /api/analysis/readiness
// @access  Private
export const getCareerReadinessAnalysis = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access analysis. Token missing.',
      });
    }

    const targetCareerName = user.targetCareer || 'Full Stack Developer';
    const isDbConnected = mongoose.connection.readyState === 1;

    let careerDoc;
    let latestResultDoc;

    if (isDbConnected) {
      // Fetch career with populated skills
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

      // Fetch latest completed assessment result
      latestResultDoc = await AssessmentResult.findOne({ user: user._id }).sort({ completedAt: -1 });

      if (!latestResultDoc) {
        return res.status(404).json({
          success: false,
          hasAssessment: false,
          message: 'No completed assessment found. Please complete a skill assessment to calculate your career readiness score.',
          career: {
            name: careerDoc.name,
          },
        });
      }

      const analysis = calculateSkillGapAndReadiness(careerDoc, latestResultDoc);
      return res.status(200).json({
        success: true,
        hasAssessment: true,
        ...analysis,
      });
    }

    // In-memory fallback mode
    careerDoc = inMemoryStore.careers.find(
      (c) => c.name === targetCareerName || c._id === user.targetCareerRef || c.id === user.targetCareerRef
    ) || inMemoryStore.careers[0];

    if (!careerDoc) {
      return res.status(404).json({
        success: false,
        message: `Target career not found in memory store.`,
      });
    }

    const userResults = inMemoryAssessmentResults.filter((r) => r.user === (user._id || user.id));
    latestResultDoc = userResults[userResults.length - 1];

    if (!latestResultDoc) {
      return res.status(404).json({
        success: false,
        hasAssessment: false,
        message: 'No completed assessment found. Please complete a skill assessment to calculate your career readiness score.',
        career: {
          name: careerDoc.name,
        },
      });
    }

    const analysis = calculateSkillGapAndReadiness(careerDoc, latestResultDoc);
    res.status(200).json({
      success: true,
      hasAssessment: true,
      ...analysis,
    });
  } catch (error) {
    console.error('Error generating career readiness analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating career readiness analysis.',
    });
  }
};
