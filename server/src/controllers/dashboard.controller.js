import mongoose from 'mongoose';
import User from '../models/User.js';
import Career from '../models/Career.js';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import Roadmap from '../models/Roadmap.js';
import { calculateSkillGapAndReadiness } from '../services/skillGap.service.js';
import { inMemoryStore } from '../config/seedData.js';
import { inMemoryAssessments, inMemoryAssessmentResults } from './assessment.controller.js';
import { inMemoryRoadmaps } from './roadmap.controller.js';
import { inMemoryUsers } from './auth.controller.js';

/**
 * @desc    Get aggregated dashboard data for authenticated student
 * @route   GET /api/dashboard
 * @access  Private (Student)
 */
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    let careerDoc = null;
    let latestResultDoc = null;

    if (isDbConnected) {
      user = await User.findById(userId);
      if (user && user.targetCareerRef) {
        careerDoc = await Career.findById(user.targetCareerRef).populate('requiredSkills.skill');
      }
      if (!careerDoc && user && user.targetCareer) {
        careerDoc = await Career.findOne({ name: user.targetCareer }).populate('requiredSkills.skill');
      }
    } else {
      user = inMemoryUsers.find((u) => u._id === userId || u.id === userId) || req.user;
      if (user && user.targetCareerRef) {
        careerDoc = inMemoryStore.careers.find(
          (c) =>
            c._id === user.targetCareerRef ||
            c.id === user.targetCareerRef ||
            (user.targetCareerRef._id && c._id === user.targetCareerRef._id)
        );
      }
      if (!careerDoc && user && user.targetCareer) {
        careerDoc = inMemoryStore.careers.find((c) => c.name === user.targetCareer);
      }
    }

    if (!user) {
      user = req.user;
    }

    const hasCareer = Boolean(careerDoc);

    const studentInfo = {
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      targetCareer: careerDoc ? careerDoc.name : (user.targetCareer || null)
    };

    // If student has not selected a target career
    if (!hasCareer) {
      return res.status(200).json({
        student: studentInfo,
        career: null,
        readiness: { score: null, assessmentScore: null },
        skillSummary: { strong: 0, moderate: 0, needsImprovement: 0, critical: 0 },
        strongestSkills: [],
        weakestSkills: [],
        skillScores: [],
        assessmentSummary: { totalAttempts: 0, latestScore: null, averageScore: null },
        assessmentHistory: [],
        roadmapProgress: { completed: 0, total: 0, percentage: 0 },
        prioritySkills: [],
        welcomeMessage: 'Select a target career to begin your skill readiness journey.',
        hasCareer: false,
        hasAssessment: false
      });
    }

    const careerInfo = {
      id: careerDoc ? (careerDoc._id || careerDoc.id) : null,
      name: careerDoc ? careerDoc.name : targetCareerName,
      description: careerDoc ? careerDoc.description : ''
    };

    // Fetch assessment history
    let completedAssessments = [];
    if (isDbConnected) {
      completedAssessments = await Assessment.find({
        user: userId,
        status: 'completed'
      }).sort({ completedAt: 1 });
      latestResultDoc = await AssessmentResult.findOne({ user: userId }).sort({ completedAt: -1 });
    } else {
      completedAssessments = inMemoryAssessments
        .filter((a) => (a.user === userId || a.user?._id === userId) && a.status === 'completed')
        .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
      const userResults = inMemoryAssessmentResults.filter((r) => r.user === userId || r.user?._id === userId);
      latestResultDoc = userResults[userResults.length - 1];
    }

    const totalAttempts = completedAssessments.length;
    const hasAssessment = totalAttempts > 0;

    let latestScore = null;
    let averageScore = null;
    const assessmentHistory = [];

    if (hasAssessment) {
      latestScore = completedAssessments[totalAttempts - 1].score;
      const totalScore = completedAssessments.reduce((sum, a) => sum + a.score, 0);
      averageScore = Math.round((totalScore / totalAttempts) * 10) / 10;

      completedAssessments.forEach((a, idx) => {
        assessmentHistory.push({
          attemptNumber: idx + 1,
          score: a.score,
          completedAt: a.completedAt,
          dateLabel: new Date(a.completedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        });
      });
    }

    // Calculate Skill Gap & Readiness using the service
    let readinessScore = null;
    let skillAnalysis = [];
    let skillSummary = { strong: 0, moderate: 0, needsImprovement: 0, critical: 0 };
    let strongestSkills = [];
    let weakestSkills = [];
    let prioritySkills = [];

    if (hasAssessment && careerDoc && latestResultDoc) {
      try {
        const gapAnalysis = calculateSkillGapAndReadiness(careerDoc, latestResultDoc);
        readinessScore = gapAnalysis.readinessScore;
        skillAnalysis = gapAnalysis.skillAnalysis || [];

        skillSummary = {
          strong: gapAnalysis.summary?.strong || 0,
          moderate: gapAnalysis.summary?.moderate || 0,
          needsImprovement: gapAnalysis.summary?.needsImprovement || 0,
          critical: gapAnalysis.summary?.critical || 0
        };

        const sortedByScore = [...skillAnalysis].sort((a, b) => b.studentScore - a.studentScore);
        const sortedByGap = [...skillAnalysis].sort((a, b) => b.gap - a.gap);

        strongestSkills = sortedByScore.slice(0, 3).map((s) => ({
          skill: s.skill,
          score: s.studentScore,
          classification: s.status
        }));

        weakestSkills = sortedByGap
          .filter((s) => s.gap > 0)
          .slice(0, 3)
          .map((s) => ({
            skill: s.skill,
            gap: s.gap,
            classification: s.status
          }));

        prioritySkills = sortedByGap
          .filter((s) => s.gap > 0)
          .slice(0, 3)
          .map((s) => ({
            skill: s.skill,
            category: s.category,
            classification: s.status,
            gap: s.gap,
            studentScore: s.studentScore,
            requiredLevel: s.requiredLevel
          }));
      } catch (err) {
        console.error('Error calculating readiness for dashboard:', err.message);
      }
    }

    // Fetch Roadmap progress
    let roadmap = null;
    if (isDbConnected) {
      roadmap = await Roadmap.findOne({ user: userId });
    } else {
      roadmap = inMemoryRoadmaps.find((r) => r.user === userId || r.user?._id === userId);
    }

    let roadmapProgress = {
      completed: 0,
      total: 0,
      percentage: 0
    };

    if (roadmap && roadmap.items && roadmap.items.length > 0) {
      const completedCount = roadmap.items.filter((i) => i.completed).length;
      const totalCount = roadmap.items.length;
      const percentage = Math.round((completedCount / totalCount) * 100);
      roadmapProgress = {
        completed: completedCount,
        total: totalCount,
        percentage
      };
    }

    // Deterministic Welcome Message
    let welcomeMessage = "You're making progress toward your target career.";
    if (!hasAssessment) {
      welcomeMessage = 'Take your first skill assessment to calculate your readiness score.';
    } else if (readinessScore >= 80) {
      welcomeMessage = 'Outstanding readiness! You are well-prepared for your target career.';
    } else if (readinessScore >= 50) {
      welcomeMessage = "You're making solid progress toward your target career.";
    } else {
      welcomeMessage = 'Focus on your highest-priority skill gaps to improve your readiness.';
    }

    return res.status(200).json({
      student: studentInfo,
      career: careerInfo,
      readiness: {
        score: readinessScore,
        assessmentScore: latestScore
      },
      skillSummary,
      strongestSkills,
      weakestSkills,
      skillScores: skillAnalysis.map((s) => ({
        skill: s.skill,
        studentScore: s.studentScore,
        requiredLevel: s.requiredLevel,
        gap: s.gap,
        classification: s.status
      })),
      assessmentSummary: {
        totalAttempts,
        latestScore,
        averageScore
      },
      assessmentHistory,
      roadmapProgress,
      prioritySkills,
      welcomeMessage,
      hasCareer: true,
      hasAssessment
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    return res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
};
