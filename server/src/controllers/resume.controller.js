import mongoose from 'mongoose';
import path from 'path';
import Career from '../models/Career.js';
import User from '../models/User.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { extractResumeText } from '../services/resumeParser.service.js';
import { analyzeResumeSkills } from '../services/resumeAnalyzer.service.js';
import { getAiResumeSuggestions } from '../services/aiResume.service.js';
import { inMemoryStore } from '../config/seedData.js';

// In-memory store fallback for offline/disconnected test modes
export const inMemoryResumeAnalyses = [];

/**
 * @desc    Upload and analyze resume against student's target career
 * @route   POST /api/resume/analyze
 * @access  Private (Student)
 */
export const analyzeResume = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Token missing.',
      });
    }

    const userId = user._id || user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX).',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Resolve student's target career
    let targetCareerName = user.targetCareer;
    let targetCareerRef = user.targetCareerRef;

    // Refresh from DB if needed
    if (isDbConnected) {
      const freshUser = await User.findById(userId);
      if (freshUser) {
        targetCareerName = freshUser.targetCareer || targetCareerName;
        targetCareerRef = freshUser.targetCareerRef || targetCareerRef;
      }
    }

    if (!targetCareerName && !targetCareerRef) {
      return res.status(400).json({
        success: false,
        message: 'Please select a target career in your profile or onboarding before analyzing your resume.',
      });
    }

    // 2. Fetch target career document with populated required skills
    let careerDoc = null;

    if (isDbConnected) {
      if (targetCareerRef) {
        careerDoc = await Career.findById(targetCareerRef).populate('requiredSkills.skill');
      }
      if (!careerDoc && targetCareerName) {
        careerDoc = await Career.findOne({ name: targetCareerName }).populate('requiredSkills.skill');
      }
    } else {
      if (targetCareerRef) {
        careerDoc = inMemoryStore.careers.find(
          (c) => c._id === targetCareerRef || c.id === targetCareerRef
        );
      }
      if (!careerDoc && targetCareerName) {
        careerDoc = inMemoryStore.careers.find((c) => c.name === targetCareerName);
      }
    }

    if (!careerDoc) {
      return res.status(404).json({
        success: false,
        message: `Target career '${targetCareerName || 'Selected Career'}' not found in the career library.`,
      });
    }

    // 3. Extract text from uploaded document
    let resumeText = '';
    try {
      resumeText = await extractResumeText(file.buffer, file.originalname, file.mimetype);
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: parseErr.message || 'Failed to extract text from resume file.',
      });
    }

    // 4. Deterministic Skill Detection and Career Comparison
    const analysis = await analyzeResumeSkills(resumeText, careerDoc);

    // 5. Generate AI / Fallback Suggestions
    const aiSuggestions = await getAiResumeSuggestions({
      resumeText,
      targetCareer: careerDoc.name,
      detectedSkills: analysis.detectedSkills,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      matchScore: analysis.matchScore,
    });

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '') || 'pdf';

    // 6. Persist Analysis Record
    let savedAnalysis = null;

    if (isDbConnected) {
      savedAnalysis = await ResumeAnalysis.create({
        user: userId,
        targetCareer: careerDoc.name,
        targetCareerRef: careerDoc._id || null,
        fileName: file.originalname,
        fileType: ext,
        fileSize: file.size,
        extractedSkills: analysis.detectedSkills,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        matchScore: analysis.matchScore,
        aiSuggestions,
        createdAt: new Date(),
      });
    } else {
      savedAnalysis = {
        _id: `resume_analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        id: `resume_analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user: userId.toString(),
        targetCareer: careerDoc.name,
        targetCareerRef: careerDoc._id || careerDoc.id,
        fileName: file.originalname,
        fileType: ext,
        fileSize: file.size,
        extractedSkills: analysis.detectedSkills,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        matchScore: analysis.matchScore,
        aiSuggestions,
        createdAt: new Date(),
      };
      inMemoryResumeAnalyses.push(savedAnalysis);
    }

    return res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: savedAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during resume analysis.',
    });
  }
};

/**
 * @desc    Get student's latest resume analysis
 * @route   GET /api/resume/latest
 * @access  Private (Student)
 */
export const getLatestResumeAnalysis = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let latest = null;

    if (isDbConnected) {
      latest = await ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });
    } else {
      const userAnalyses = inMemoryResumeAnalyses
        .filter((a) => a.user === userId.toString() || a.user?._id === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      latest = userAnalyses[0] || null;
    }

    if (!latest) {
      return res.status(200).json({
        success: true,
        hasAnalysis: false,
        message: 'No resume analysis found for this student.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasAnalysis: true,
      data: latest,
    });
  } catch (error) {
    console.error('Error fetching latest resume analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving latest resume analysis.',
    });
  }
};

/**
 * @desc    Get student's resume analysis history
 * @route   GET /api/resume/history
 * @access  Private (Student)
 */
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let history = [];

    if (isDbConnected) {
      history = await ResumeAnalysis.find({ user: userId }).sort({ createdAt: -1 });
    } else {
      history = inMemoryResumeAnalyses
        .filter((a) => a.user === userId.toString() || a.user?._id === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching resume history:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving resume analysis history.',
    });
  }
};

/**
 * @desc    Get specific resume analysis by ID (Student Data Isolation Protected)
 * @route   GET /api/resume/:id
 * @access  Private (Student)
 */
export const getResumeAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();
    const isDbConnected = mongoose.connection.readyState === 1;

    let analysis = null;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resume analysis ID format.',
        });
      }
      analysis = await ResumeAnalysis.findById(id);
    } else {
      analysis = inMemoryResumeAnalyses.find((a) => a._id === id || a.id === id);
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found.',
      });
    }

    // Student Data Isolation Security Check
    const ownerId = (analysis.user?._id || analysis.user).toString();
    if (ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this resume analysis.',
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error fetching resume analysis by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving resume analysis details.',
    });
  }
};
