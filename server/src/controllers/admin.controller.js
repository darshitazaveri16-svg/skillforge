import mongoose from 'mongoose';
import User from '../models/User.js';
import Career from '../models/Career.js';
import Skill from '../models/Skill.js';
import Question from '../models/Question.js';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import Roadmap from '../models/Roadmap.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { inMemoryStore } from '../config/seedData.js';
import { inMemoryUsers } from './auth.controller.js';
import { inMemoryAssessments, inMemoryAssessmentResults } from './assessment.controller.js';
import { inMemoryResumeAnalyses } from './resume.controller.js';
import { inMemoryRoadmaps } from './roadmap.controller.js';

// =========================================================================
// 1. ADMIN DASHBOARD ANALYTICS
// =========================================================================

/**
 * @desc    Get aggregated platform analytics for Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // 1. Core Entity Counts
      const [
        totalStudents,
        totalCareers,
        totalSkills,
        totalQuestions,
        totalAssessments,
        completedAssessments,
        totalResumeAnalyses,
      ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Career.countDocuments(),
        Skill.countDocuments(),
        Question.countDocuments(),
        Assessment.countDocuments(),
        Assessment.countDocuments({ status: 'completed' }),
        ResumeAnalysis.countDocuments(),
      ]);

      // 2. Average Assessment Score
      const assessmentAvgAgg = await AssessmentResult.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
      ]);
      const rawAvgAssessment = assessmentAvgAgg[0]?.avgScore ?? 0;
      const averageAssessmentScore = Math.round(rawAvgAssessment * 10) / 10;

      // 3. Average Resume Match Score
      const resumeAvgAgg = await ResumeAnalysis.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$matchScore' } } },
      ]);
      const rawAvgResume = resumeAvgAgg[0]?.avgScore ?? 0;
      const averageResumeMatchScore = Math.round(rawAvgResume * 10) / 10;

      // 4. Career Distribution (Students grouped by target career)
      const careerDistAgg = await User.aggregate([
        { $match: { role: 'student', targetCareer: { $ne: null } } },
        { $group: { _id: '$targetCareer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      const careerDistribution = careerDistAgg.map((item) => ({
        career: item._id || 'Unassigned',
        count: item.count,
      }));

      // 5. Assessment Activity (Recent completed assessments)
      const recentAssessments = await Assessment.find({ status: 'completed' })
        .select('careerName currentDifficulty answers completedAt createdAt')
        .sort({ completedAt: -1 })
        .limit(10)
        .lean();

      const assessmentActivity = recentAssessments.map((a) => ({
        id: a._id,
        careerName: a.careerName,
        completedAt: a.completedAt || a.createdAt,
        totalAnswers: a.answers ? a.answers.length : 0,
      }));

      // 6. Recent Registered Students (No passwords exposed!)
      const recentStudents = await User.find({ role: 'student' })
        .select('name email targetCareer createdAt')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          totalStudents,
          totalCareers,
          totalSkills,
          totalQuestions,
          totalAssessments,
          completedAssessments,
          totalResumeAnalyses,
          averageAssessmentScore,
          averageResumeMatchScore,
          careerDistribution,
          assessmentActivity,
          recentStudents,
        },
      });
    }

    // IN-MEMORY FALLBACK MODE
    const students = inMemoryUsers.filter((u) => u.role === 'student' || !u.role);
    const completedAsms = inMemoryAssessments.filter((a) => a.status === 'completed');
    
    // Average Assessment Score
    let avgAsm = 0;
    if (inMemoryAssessmentResults.length > 0) {
      const sum = inMemoryAssessmentResults.reduce((acc, r) => acc + (r.overallScore || 0), 0);
      avgAsm = Math.round((sum / inMemoryAssessmentResults.length) * 10) / 10;
    }

    // Average Resume Score
    let avgResume = 0;
    if (inMemoryResumeAnalyses.length > 0) {
      const sum = inMemoryResumeAnalyses.reduce((acc, r) => acc + (r.matchScore || 0), 0);
      avgResume = Math.round((sum / inMemoryResumeAnalyses.length) * 10) / 10;
    }

    // Career Distribution
    const distMap = {};
    students.forEach((s) => {
      const c = s.targetCareer || 'Unassigned';
      distMap[c] = (distMap[c] || 0) + 1;
    });
    const careerDistribution = Object.entries(distMap).map(([career, count]) => ({ career, count }));

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: students.length,
        totalCareers: inMemoryStore.careers ? inMemoryStore.careers.length : 0,
        totalSkills: inMemoryStore.skills ? inMemoryStore.skills.length : 0,
        totalQuestions: inMemoryStore.questions ? inMemoryStore.questions.length : 0,
        totalAssessments: inMemoryAssessments.length,
        completedAssessments: completedAsms.length,
        totalResumeAnalyses: inMemoryResumeAnalyses.length,
        averageAssessmentScore: avgAsm,
        averageResumeMatchScore: avgResume,
        careerDistribution,
        assessmentActivity: completedAsms.slice(-10).map((a) => ({
          id: a._id || a.id,
          careerName: a.careerName,
          completedAt: a.completedAt,
        })),
        recentStudents: students.slice(-8).map((s) => ({
          _id: s._id || s.id,
          id: s._id || s.id,
          name: s.name,
          email: s.email,
          targetCareer: s.targetCareer,
          createdAt: s.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin dashboard analytics.',
    });
  }
};

// =========================================================================
// 2. STUDENT MANAGEMENT
// =========================================================================

/**
 * @desc    Get paginated, filterable list of students
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
export const getStudents = async (req, res) => {
  try {
    const { search, career, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * pageLimit;

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const filter = { role: 'student' };

      if (search && search.trim()) {
        const term = search.trim();
        filter.$or = [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
        ];
      }

      if (career && career.trim() && career !== 'all') {
        filter.targetCareer = career.trim();
      }

      const [totalCount, students] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
          .select('name email role targetCareer targetCareerRef createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit)
          .lean(),
      ]);

      return res.status(200).json({
        success: true,
        count: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / pageLimit) || 1,
        data: students,
      });
    }

    // In-memory fallback
    let filtered = inMemoryUsers.filter((u) => u.role === 'student' || !u.role);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    if (career && career.trim() && career !== 'all') {
      filtered = filtered.filter((u) => u.targetCareer === career.trim());
    }

    const totalCount = filtered.length;
    const paged = filtered.slice(skip, skip + pageLimit).map((u) => ({
      _id: u._id || u.id,
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'student',
      targetCareer: u.targetCareer,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / pageLimit) || 1,
      data: paged,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving students.',
    });
  }
};

// =========================================================================
// 3. CAREER MANAGEMENT
// =========================================================================

/**
 * @desc    Get all careers with populated skills for admin
 * @route   GET /api/admin/careers
 * @access  Private (Admin)
 */
export const getAdminCareers = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const careers = await Career.find().populate('requiredSkills.skill');
      return res.status(200).json({
        success: true,
        count: careers.length,
        data: careers,
      });
    }

    return res.status(200).json({
      success: true,
      count: inMemoryStore.careers ? inMemoryStore.careers.length : 0,
      data: inMemoryStore.careers || [],
    });
  } catch (error) {
    console.error('Error fetching admin careers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving careers.',
    });
  }
};

/**
 * @desc    Create a new career
 * @route   POST /api/admin/careers
 * @access  Private (Admin)
 */
export const createCareer = async (req, res) => {
  try {
    const { name, description, requiredSkills = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a career title.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a career description.',
      });
    }

    const trimmedName = name.trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existing = await Career.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A career titled "${trimmedName}" already exists.`,
        });
      }

      // Format requiredSkills
      const formattedSkills = (requiredSkills || []).map((item) => ({
        skill: item.skill?._id || item.skill || item.id,
        targetLevel: typeof item.targetLevel === 'number' ? item.targetLevel : 80,
      }));

      const newCareer = await Career.create({
        name: trimmedName,
        description: description.trim(),
        requiredSkills: formattedSkills,
        createdAt: new Date(),
      });

      const populated = await Career.findById(newCareer._id).populate('requiredSkills.skill');

      return res.status(201).json({
        success: true,
        message: 'Career created successfully.',
        data: populated,
      });
    }

    // In-memory fallback
    const existing = inMemoryStore.careers.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A career titled "${trimmedName}" already exists.`,
      });
    }

    const memCareer = {
      _id: `career_${Date.now()}`,
      id: `career_${Date.now()}`,
      name: trimmedName,
      description: description.trim(),
      requiredSkills: requiredSkills || [],
      createdAt: new Date(),
    };
    inMemoryStore.careers.push(memCareer);

    return res.status(201).json({
      success: true,
      message: 'Career created successfully.',
      data: memCareer,
    });
  } catch (error) {
    console.error('Error creating career:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating career.',
    });
  }
};

/**
 * @desc    Update an existing career
 * @route   PUT /api/admin/careers/:id
 * @access  Private (Admin)
 */
export const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, requiredSkills } = req.body;

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid career ID.' });
      }

      const career = await Career.findById(id);
      if (!career) {
        return res.status(404).json({ success: false, message: 'Career not found.' });
      }

      if (name && name.trim()) {
        const trimmedName = name.trim();
        // Check uniqueness if name changed
        if (trimmedName.toLowerCase() !== career.name.toLowerCase()) {
          const duplicate = await Career.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
          });
          if (duplicate) {
            return res.status(400).json({
              success: false,
              message: `Another career is already named "${trimmedName}".`,
            });
          }
        }
        career.name = trimmedName;
      }

      if (description && description.trim()) {
        career.description = description.trim();
      }

      if (Array.isArray(requiredSkills)) {
        career.requiredSkills = requiredSkills.map((item) => ({
          skill: item.skill?._id || item.skill || item.id,
          targetLevel: typeof item.targetLevel === 'number' ? item.targetLevel : 80,
        }));
      }

      await career.save();
      const populated = await Career.findById(id).populate('requiredSkills.skill');

      return res.status(200).json({
        success: true,
        message: 'Career updated successfully.',
        data: populated,
      });
    }

    // In-memory fallback
    const memCareer = inMemoryStore.careers.find((c) => c._id === id || c.id === id);
    if (!memCareer) {
      return res.status(404).json({ success: false, message: 'Career not found.' });
    }

    if (name) memCareer.name = name.trim();
    if (description) memCareer.description = description.trim();
    if (Array.isArray(requiredSkills)) memCareer.requiredSkills = requiredSkills;

    return res.status(200).json({
      success: true,
      message: 'Career updated successfully.',
      data: memCareer,
    });
  } catch (error) {
    console.error('Error updating career:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating career.',
    });
  }
};

/**
 * @desc    Delete a career (Strict Data Integrity Protection)
 * @route   DELETE /api/admin/careers/:id
 * @access  Private (Admin)
 */
export const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid career ID.' });
      }

      const career = await Career.findById(id);
      if (!career) {
        return res.status(404).json({ success: false, message: 'Career not found.' });
      }

      // Check whether this career is referenced by users, assessments, resume analyses, or roadmaps
      const [
        studentRefs,
        assessmentRefs,
        resumeRefs,
        roadmapRefs,
      ] = await Promise.all([
        User.countDocuments({
          $or: [{ targetCareerRef: id }, { targetCareer: career.name }],
        }),
        Assessment.countDocuments({
          $or: [{ career: id }, { careerName: career.name }],
        }),
        ResumeAnalysis.countDocuments({
          $or: [{ targetCareerRef: id }, { targetCareer: career.name }],
        }),
        Roadmap.countDocuments({
          $or: [{ career: id }, { careerName: career.name }],
        }),
      ]);

      const totalRefs = studentRefs + assessmentRefs + resumeRefs + roadmapRefs;

      if (totalRefs > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete career "${career.name}" because it is actively referenced by ${studentRefs} student(s), ${assessmentRefs} assessment(s), ${resumeRefs} resume analysis/analyses, and ${roadmapRefs} learning roadmap(s). Please reassign or remove dependent data first to preserve data integrity.`,
          references: {
            students: studentRefs,
            assessments: assessmentRefs,
            resumeAnalyses: resumeRefs,
            roadmaps: roadmapRefs,
          },
        });
      }

      await Career.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: `Career "${career.name}" was successfully deleted.`,
      });
    }

    // In-memory fallback
    const idx = inMemoryStore.careers.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Career not found.' });
    }

    const careerName = inMemoryStore.careers[idx].name;
    const studentRefs = inMemoryUsers.filter((u) => u.targetCareer === careerName).length;
    if (studentRefs > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete career "${careerName}" because it is referenced by ${studentRefs} student(s).`,
      });
    }

    inMemoryStore.careers.splice(idx, 1);
    return res.status(200).json({
      success: true,
      message: `Career "${careerName}" was successfully deleted.`,
    });
  } catch (error) {
    console.error('Error deleting career:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting career.',
    });
  }
};

// =========================================================================
// 4. SKILL MANAGEMENT
// =========================================================================

/**
 * @desc    Get all skills enriched with associated careers
 * @route   GET /api/admin/skills
 * @access  Private (Admin)
 */
export const getAdminSkills = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const [skills, careers] = await Promise.all([
        Skill.find().sort({ name: 1 }).lean(),
        Career.find().select('name requiredSkills').lean(),
      ]);

      // Map skill associations
      const enrichedSkills = skills.map((skill) => {
        const associatedCareers = careers
          .filter((c) =>
            c.requiredSkills?.some(
              (r) =>
                r.skill?.toString() === skill._id.toString() ||
                r.skill?._id?.toString() === skill._id.toString()
            )
          )
          .map((c) => c.name);

        return {
          ...skill,
          associatedCareers,
          associatedCareerCount: associatedCareers.length,
        };
      });

      return res.status(200).json({
        success: true,
        count: enrichedSkills.length,
        data: enrichedSkills,
      });
    }

    // In-memory fallback
    const skills = inMemoryStore.skills || [];
    const careers = inMemoryStore.careers || [];

    const enriched = skills.map((sk) => {
      const associated = careers
        .filter((c) =>
          c.requiredSkills?.some(
            (r) =>
              r.skill?.name === sk.name ||
              r.skill?._id === sk._id ||
              r.skill === sk._id
          )
        )
        .map((c) => c.name);

      return {
        ...sk,
        associatedCareers: associated,
        associatedCareerCount: associated.length,
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error('Error fetching admin skills:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving skills.',
    });
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/admin/skills
 * @access  Private (Admin)
 */
export const createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a skill name.',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a skill category (e.g. Frontend, Backend, Database, Data Analysis, Security, DevOps, Testing, Core).',
      });
    }

    const trimmedName = name.trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existing = await Skill.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A skill named "${trimmedName}" already exists.`,
        });
      }

      const newSkill = await Skill.create({
        name: trimmedName,
        category: category.trim(),
        description: description ? description.trim() : '',
        createdAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: 'Skill created successfully.',
        data: {
          ...newSkill.toObject(),
          associatedCareers: [],
          associatedCareerCount: 0,
        },
      });
    }

    // In-memory fallback
    const existing = inMemoryStore.skills.find(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A skill named "${trimmedName}" already exists.`,
      });
    }

    const memSkill = {
      _id: `skill_${Date.now()}`,
      id: `skill_${Date.now()}`,
      name: trimmedName,
      category: category.trim(),
      description: description ? description.trim() : '',
      associatedCareers: [],
      associatedCareerCount: 0,
      createdAt: new Date(),
    };
    inMemoryStore.skills.push(memSkill);

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully.',
      data: memSkill,
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating skill.',
    });
  }
};

/**
 * @desc    Update a skill
 * @route   PUT /api/admin/skills/:id
 * @access  Private (Admin)
 */
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid skill ID.' });
      }

      const skill = await Skill.findById(id);
      if (!skill) {
        return res.status(404).json({ success: false, message: 'Skill not found.' });
      }

      if (name && name.trim()) {
        const trimmedName = name.trim();
        if (trimmedName.toLowerCase() !== skill.name.toLowerCase()) {
          const duplicate = await Skill.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
          });
          if (duplicate) {
            return res.status(400).json({
              success: false,
              message: `Another skill named "${trimmedName}" already exists.`,
            });
          }
        }
        skill.name = trimmedName;
      }

      if (category && category.trim()) {
        skill.category = category.trim();
      }

      if (description !== undefined) {
        skill.description = description.trim();
      }

      await skill.save();

      return res.status(200).json({
        success: true,
        message: 'Skill updated successfully.',
        data: skill,
      });
    }

    // In-memory fallback
    const memSkill = inMemoryStore.skills.find((s) => s._id === id || s.id === id);
    if (!memSkill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    if (name) memSkill.name = name.trim();
    if (category) memSkill.category = category.trim();
    if (description !== undefined) memSkill.description = description.trim();

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully.',
      data: memSkill,
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating skill.',
    });
  }
};

/**
 * @desc    Delete a skill (Data Integrity Protected)
 * @route   DELETE /api/admin/skills/:id
 * @access  Private (Admin)
 */
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid skill ID.' });
      }

      const skill = await Skill.findById(id);
      if (!skill) {
        return res.status(404).json({ success: false, message: 'Skill not found.' });
      }

      // Check whether skill is referenced by Careers or Questions
      const [careerRefs, questionRefs] = await Promise.all([
        Career.countDocuments({ 'requiredSkills.skill': id }),
        Question.countDocuments({ skill: id }),
      ]);

      if (careerRefs > 0 || questionRefs > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete skill "${skill.name}" because it is linked to ${careerRefs} career(s) and ${questionRefs} assessment question(s). Please remove these associations first.`,
          references: {
            careers: careerRefs,
            questions: questionRefs,
          },
        });
      }

      await Skill.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: `Skill "${skill.name}" was successfully deleted.`,
      });
    }

    // In-memory fallback
    const idx = inMemoryStore.skills.findIndex((s) => s._id === id || s.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    const skillName = inMemoryStore.skills[idx].name;
    const isUsedInCareer = inMemoryStore.careers.some((c) =>
      c.requiredSkills?.some((r) => r.skill?.name === skillName)
    );

    if (isUsedInCareer) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete skill "${skillName}" because it is referenced in target career specifications.`,
      });
    }

    inMemoryStore.skills.splice(idx, 1);
    return res.status(200).json({
      success: true,
      message: `Skill "${skillName}" was successfully deleted.`,
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting skill.',
    });
  }
};

// =========================================================================
// 5. QUESTION MANAGEMENT
// =========================================================================

/**
 * @desc    Get questions for admin with full correctAnswer details & filters
 * @route   GET /api/admin/questions
 * @access  Private (Admin)
 */
export const getAdminQuestions = async (req, res) => {
  try {
    const { career, skill, difficulty, search, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * pageLimit;

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const filter = {};

      if (difficulty && difficulty !== 'all') {
        filter.difficulty = difficulty.toLowerCase();
      }

      if (skill && skill !== 'all') {
        if (mongoose.Types.ObjectId.isValid(skill)) {
          filter.skill = skill;
        } else {
          const skillDoc = await Skill.findOne({ name: skill });
          if (skillDoc) filter.skill = skillDoc._id;
        }
      }

      // If career filter provided, match career field OR skills required by that career
      if (career && career !== 'all') {
        let careerDoc = null;
        if (mongoose.Types.ObjectId.isValid(career)) {
          careerDoc = await Career.findById(career);
        } else {
          careerDoc = await Career.findOne({ name: career });
        }

        if (careerDoc && careerDoc.requiredSkills) {
          const careerSkillIds = careerDoc.requiredSkills.map((r) => r.skill);
          filter.$or = [
            { career: careerDoc._id },
            { skill: { $in: careerSkillIds } },
          ];
        }
      }

      if (search && search.trim()) {
        filter.question = { $regex: search.trim(), $options: 'i' };
      }

      const [totalCount, questions] = await Promise.all([
        Question.countDocuments(filter),
        Question.find(filter)
          .select('+correctAnswer') // EXPLICITLY INCLUDE correctAnswer FOR ADMIN
          .populate('skill', 'name category')
          .populate('career', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit)
          .lean(),
      ]);

      return res.status(200).json({
        success: true,
        count: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / pageLimit) || 1,
        data: questions,
      });
    }

    // In-memory fallback
    let list = inMemoryStore.questions || [];

    if (difficulty && difficulty !== 'all') {
      list = list.filter((q) => q.difficulty === difficulty.toLowerCase());
    }

    if (skill && skill !== 'all') {
      list = list.filter((q) => q.skillName === skill || q.skill === skill);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((q) => q.question.toLowerCase().includes(term));
    }

    const totalCount = list.length;
    const paged = list.slice(skip, skip + pageLimit);

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / pageLimit) || 1,
      data: paged,
    });
  } catch (error) {
    console.error('Error fetching admin questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving questions.',
    });
  }
};

/**
 * @desc    Create a new question
 * @route   POST /api/admin/questions
 * @access  Private (Admin)
 */
export const createQuestion = async (req, res) => {
  try {
    const {
      question,
      questionText,
      options,
      correctAnswer,
      explanation,
      difficulty,
      skill,
      career,
    } = req.body;

    const qText = (question || questionText || '').trim();
    if (!qText) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required.',
      });
    }

    // Validate options: exactly 4 non-empty strings
    if (!Array.isArray(options) || options.length !== 4 || options.some((opt) => typeof opt !== 'string' || !opt.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Question must have exactly 4 non-empty multiple choice options.',
      });
    }

    // Validate correct answer (can be numeric index 0-3 or matching option string)
    let correctIndex = -1;
    if (typeof correctAnswer === 'number') {
      correctIndex = correctAnswer;
    } else if (typeof correctAnswer === 'string') {
      // Find matching string or check if string is '0', '1', '2', '3'
      if (/^[0-3]$/.test(correctAnswer.trim())) {
        correctIndex = parseInt(correctAnswer.trim(), 10);
      } else {
        correctIndex = options.findIndex(
          (opt) => opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
        );
      }
    }

    if (correctIndex < 0 || correctIndex > 3) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer must be an option index (0-3) or match one of the 4 options exactly.',
      });
    }

    // Validate difficulty
    const normalizedDiff = (difficulty || 'medium').toLowerCase().trim();
    if (!['easy', 'medium', 'hard'].includes(normalizedDiff)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be one of: easy, medium, hard.',
      });
    }

    // Validate explanation
    if (!explanation || !explanation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an explanation for the correct answer.',
      });
    }

    // Validate skill
    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Please select an associated skill.',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let skillDoc = null;
      if (mongoose.Types.ObjectId.isValid(skill)) {
        skillDoc = await Skill.findById(skill);
      } else {
        skillDoc = await Skill.findOne({ name: skill });
      }

      if (!skillDoc) {
        return res.status(400).json({
          success: false,
          message: 'The selected skill does not exist in the skill library.',
        });
      }

      let careerDoc = null;
      if (career) {
        if (mongoose.Types.ObjectId.isValid(career)) {
          careerDoc = await Career.findById(career);
        } else {
          careerDoc = await Career.findOne({ name: career });
        }
      }

      const newQ = await Question.create({
        question: qText,
        options: options.map((opt) => opt.trim()),
        correctAnswer: correctIndex,
        explanation: explanation.trim(),
        difficulty: normalizedDiff,
        skill: skillDoc._id,
        career: careerDoc ? careerDoc._id : null,
        createdAt: new Date(),
      });

      const populated = await Question.findById(newQ._id)
        .select('+correctAnswer')
        .populate('skill', 'name category')
        .populate('career', 'name');

      return res.status(201).json({
        success: true,
        message: 'Question created successfully.',
        data: populated,
      });
    }

    // In-memory fallback
    const memQ = {
      _id: `q_${Date.now()}`,
      id: `q_${Date.now()}`,
      question: qText,
      options: options.map((opt) => opt.trim()),
      correctAnswer: correctIndex,
      explanation: explanation.trim(),
      difficulty: normalizedDiff,
      skillName: skill,
      createdAt: new Date(),
    };

    if (!inMemoryStore.questions) inMemoryStore.questions = [];
    inMemoryStore.questions.push(memQ);

    return res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      data: memQ,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating question.',
    });
  }
};

/**
 * @desc    Update an existing question
 * @route   PUT /api/admin/questions/:id
 * @access  Private (Admin)
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      questionText,
      options,
      correctAnswer,
      explanation,
      difficulty,
      skill,
      career,
    } = req.body;

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid question ID.' });
      }

      const qDoc = await Question.findById(id).select('+correctAnswer');
      if (!qDoc) {
        return res.status(404).json({ success: false, message: 'Question not found.' });
      }

      const qText = (question || questionText);
      if (qText !== undefined) {
        if (!qText.trim()) {
          return res.status(400).json({ success: false, message: 'Question text cannot be empty.' });
        }
        qDoc.question = qText.trim();
      }

      if (options !== undefined) {
        if (!Array.isArray(options) || options.length !== 4) {
          return res.status(400).json({ success: false, message: 'Questions must have exactly 4 options.' });
        }
        qDoc.options = options.map((opt) => opt.trim());
      }

      if (correctAnswer !== undefined) {
        let correctIndex = -1;
        const currentOpts = options || qDoc.options;
        if (typeof correctAnswer === 'number') {
          correctIndex = correctAnswer;
        } else if (typeof correctAnswer === 'string') {
          if (/^[0-3]$/.test(correctAnswer.trim())) {
            correctIndex = parseInt(correctAnswer.trim(), 10);
          } else {
            correctIndex = currentOpts.findIndex(
              (opt) => opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
            );
          }
        }
        if (correctIndex < 0 || correctIndex > 3) {
          return res.status(400).json({
            success: false,
            message: 'Correct answer must be an option index (0-3) or match one of the options.',
          });
        }
        qDoc.correctAnswer = correctIndex;
      }

      if (explanation !== undefined) {
        qDoc.explanation = explanation.trim();
      }

      if (difficulty !== undefined) {
        const normDiff = difficulty.toLowerCase().trim();
        if (!['easy', 'medium', 'hard'].includes(normDiff)) {
          return res.status(400).json({ success: false, message: 'Difficulty must be easy, medium, or hard.' });
        }
        qDoc.difficulty = normDiff;
      }

      if (skill) {
        let skillDoc = null;
        if (mongoose.Types.ObjectId.isValid(skill)) {
          skillDoc = await Skill.findById(skill);
        } else {
          skillDoc = await Skill.findOne({ name: skill });
        }
        if (skillDoc) qDoc.skill = skillDoc._id;
      }

      if (career !== undefined) {
        if (career && mongoose.Types.ObjectId.isValid(career)) {
          qDoc.career = career;
        } else if (!career) {
          qDoc.career = null;
        }
      }

      await qDoc.save();

      const populated = await Question.findById(id)
        .select('+correctAnswer')
        .populate('skill', 'name category')
        .populate('career', 'name');

      return res.status(200).json({
        success: true,
        message: 'Question updated successfully.',
        data: populated,
      });
    }

    // In-memory fallback
    const memQ = inMemoryStore.questions?.find((q) => q._id === id || q.id === id);
    if (!memQ) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    if (question || questionText) memQ.question = (question || questionText).trim();
    if (Array.isArray(options) && options.length === 4) memQ.options = options.map((o) => o.trim());
    if (correctAnswer !== undefined) memQ.correctAnswer = correctAnswer;
    if (explanation) memQ.explanation = explanation.trim();
    if (difficulty) memQ.difficulty = difficulty.toLowerCase().trim();

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      data: memQ,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating question.',
    });
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/admin/questions/:id
 * @access  Private (Admin)
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid question ID.' });
      }

      const q = await Question.findByIdAndDelete(id);
      if (!q) {
        return res.status(404).json({ success: false, message: 'Question not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully.',
      });
    }

    // In-memory fallback
    const idx = inMemoryStore.questions?.findIndex((q) => q._id === id || q.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    inMemoryStore.questions.splice(idx, 1);
    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting question.',
    });
  }
};
