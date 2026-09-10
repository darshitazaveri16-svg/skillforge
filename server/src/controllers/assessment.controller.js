import mongoose from 'mongoose';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import Question from '../models/Question.js';
import Career from '../models/Career.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import { inMemoryStore } from '../config/seedData.js';

// Fallback in-memory assessment data store
export const inMemoryAssessments = [];
export const inMemoryAssessmentResults = [];

// Helper for deterministic adaptive difficulty
const getNextDifficulty = (currentDifficulty, isCorrect) => {
  if (isCorrect) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return 'hard';
  } else {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return 'easy';
  }
};

// @desc    Start a new skill assessment for user's target career
// @route   POST /api/assessment/start
// @access  Private
export const startAssessment = async (req, res) => {
  try {
    const user = req.user;
    const targetCareerName = user.targetCareer || 'Full Stack Developer';

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const career = await Career.findOne({ name: targetCareerName }).populate('requiredSkills.skill');
      if (!career) {
        return res.status(404).json({
          success: false,
          message: 'Selected target career track not found. Please select a career first.',
        });
      }

      const skillIds = career.requiredSkills.map((rs) => rs.skill._id || rs.skill);

      // Create new Assessment document
      const assessment = await Assessment.create({
        user: user._id,
        career: career._id,
        careerName: career.name,
        currentDifficulty: 'medium',
        status: 'in_progress',
        answers: [],
      });

      // Find first question (medium difficulty matching career skills)
      let firstQuestion = await Question.findOne({
        skill: { $in: skillIds },
        difficulty: 'medium',
      }).populate('skill');

      if (!firstQuestion) {
        // Fallback to any available question for career skills
        firstQuestion = await Question.findOne({
          skill: { $in: skillIds },
        }).populate('skill');
      }

      if (!firstQuestion) {
        return res.status(404).json({
          success: false,
          message: 'No questions available for your target career track.',
        });
      }

      return res.status(201).json({
        success: true,
        assessmentId: assessment._id,
        careerName: career.name,
        question: {
          _id: firstQuestion._id,
          id: firstQuestion._id,
          question: firstQuestion.question,
          options: firstQuestion.options,
          difficulty: firstQuestion.difficulty,
          skillName: firstQuestion.skill?.name || 'Core Skill',
        },
        totalQuestionsAvailable: 6, // 6 questions per session
      });
    }

    // In-memory fallback execution
    const careerObj = inMemoryStore.careers.find((c) => c.name === targetCareerName) || inMemoryStore.careers[0];
    if (!careerObj) {
      return res.status(404).json({
        success: false,
        message: 'No career track found.',
      });
    }

    const memAssessment = {
      _id: `asm_${Date.now()}`,
      id: `asm_${Date.now()}`,
      user: user._id || user.id,
      career: careerObj._id,
      careerName: careerObj.name,
      currentDifficulty: 'medium',
      status: 'in_progress',
      answers: [],
      createdAt: new Date(),
    };

    inMemoryAssessments.push(memAssessment);

    const firstQ = inMemoryStore.questions.find((q) => q.difficulty === 'medium') || inMemoryStore.questions[0];

    res.status(201).json({
      success: true,
      assessmentId: memAssessment._id,
      careerName: careerObj.name,
      question: {
        _id: firstQ._id,
        id: firstQ._id,
        question: firstQ.question,
        options: firstQ.options,
        difficulty: firstQ.difficulty,
        skillName: firstQ.skillName || 'Core Skill',
      },
      totalQuestionsAvailable: 6,
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting assessment.',
    });
  }
};

// @desc    Submit an answer and get next question
// @route   POST /api/assessment/:id/submit
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, selectedOption } = req.body;

    if (selectedOption === undefined || selectedOption === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide selectedOption.',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const assessment = await Assessment.findById(id);
      if (!assessment || assessment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this assessment.',
        });
      }

      if (assessment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'This assessment is already completed.',
        });
      }

      // Fetch question including correctAnswer
      const question = await Question.findById(questionId).select('+correctAnswer').populate('skill');
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found.',
        });
      }

      const isCorrect = Number(selectedOption) === Number(question.correctAnswer);
      const newDifficulty = getNextDifficulty(assessment.currentDifficulty, isCorrect);

      // Record answer
      assessment.answers.push({
        question: question._id,
        skill: question.skill._id || question.skill,
        selectedOption: Number(selectedOption),
        isCorrect,
        difficulty: question.difficulty,
      });

      assessment.currentDifficulty = newDifficulty;
      await assessment.save();

      const answeredQuestionIds = assessment.answers.map((a) => a.question);
      const MAX_QUESTIONS = 6;

      // Check if maximum questions reached
      if (assessment.answers.length >= MAX_QUESTIONS) {
        return res.status(200).json({
          success: true,
          isCorrect,
          explanation: question.explanation,
          isFinished: true,
        });
      }

      // Fetch next question matching new difficulty
      const career = await Career.findById(assessment.career);
      const skillIds = career.requiredSkills.map((rs) => rs.skill);

      let nextQuestion = await Question.findOne({
        _id: { $nin: answeredQuestionIds },
        skill: { $in: skillIds },
        difficulty: newDifficulty,
      }).populate('skill');

      if (!nextQuestion) {
        // Fallback to any unanswered question in career skills
        nextQuestion = await Question.findOne({
          _id: { $nin: answeredQuestionIds },
          skill: { $in: skillIds },
        }).populate('skill');
      }

      if (!nextQuestion) {
        return res.status(200).json({
          success: true,
          isCorrect,
          explanation: question.explanation,
          isFinished: true,
        });
      }

      return res.status(200).json({
        success: true,
        isCorrect,
        explanation: question.explanation,
        isFinished: false,
        nextQuestion: {
          _id: nextQuestion._id,
          id: nextQuestion._id,
          question: nextQuestion.question,
          options: nextQuestion.options,
          difficulty: nextQuestion.difficulty,
          skillName: nextQuestion.skill?.name || 'Core Skill',
        },
      });
    }

    // In-memory fallback execution
    const memAssessment = inMemoryAssessments.find((a) => a._id === id || a.id === id);
    if (!memAssessment || memAssessment.user !== (req.user._id || req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assessment.',
      });
    }

    const qObj = inMemoryStore.questions.find((q) => q._id === questionId || q.id === questionId);
    if (!qObj) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in memory store.',
      });
    }

    const isCorrect = Number(selectedOption) === Number(qObj.correctAnswer);
    const newDifficulty = getNextDifficulty(memAssessment.currentDifficulty, isCorrect);

    memAssessment.answers.push({
      question: qObj._id,
      skill: qObj.skill._id || qObj.skill,
      selectedOption: Number(selectedOption),
      isCorrect,
      difficulty: qObj.difficulty,
      qRef: qObj,
    });

    memAssessment.currentDifficulty = newDifficulty;

    const answeredIds = memAssessment.answers.map((a) => a.question);
    const MAX_QUESTIONS = 6;

    if (memAssessment.answers.length >= MAX_QUESTIONS) {
      return res.status(200).json({
        success: true,
        isCorrect,
        explanation: qObj.explanation,
        isFinished: true,
      });
    }

    const nextQ = inMemoryStore.questions.find(
      (q) => !answeredIds.includes(q._id) && q.difficulty === newDifficulty
    ) || inMemoryStore.questions.find((q) => !answeredIds.includes(q._id));

    if (!nextQ) {
      return res.status(200).json({
        success: true,
        isCorrect,
        explanation: qObj.explanation,
        isFinished: true,
      });
    }

    res.status(200).json({
      success: true,
      isCorrect,
      explanation: qObj.explanation,
      isFinished: false,
      nextQuestion: {
        _id: nextQ._id,
        id: nextQ._id,
        question: nextQ.question,
        options: nextQ.options,
        difficulty: nextQ.difficulty,
        skillName: nextQ.skillName || 'Core Skill',
      },
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting answer.',
    });
  }
};

// @desc    Complete assessment and compute skill-wise scores
// @route   POST /api/assessment/:id/complete
// @access  Private
export const completeAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const assessment = await Assessment.findById(id).populate({
        path: 'answers.question',
        select: '+correctAnswer +explanation',
        populate: { path: 'skill' },
      });

      if (!assessment || assessment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this assessment.',
        });
      }

      assessment.status = 'completed';
      assessment.completedAt = new Date();
      await assessment.save();

      // Aggregate skill-wise scores
      const skillMap = {};
      let totalCorrect = 0;

      assessment.answers.forEach((ans) => {
        const qDoc = ans.question;
        const skillName = qDoc.skill?.name || 'Core Technical';
        const skillId = qDoc.skill?._id || qDoc.skill;

        if (ans.isCorrect) totalCorrect++;

        if (!skillMap[skillName]) {
          skillMap[skillName] = { skill: skillId, skillName, attempted: 0, correct: 0 };
        }
        skillMap[skillName].attempted++;
        if (ans.isCorrect) skillMap[skillName].correct++;
      });

      const skillScores = Object.values(skillMap).map((item) => ({
        skill: item.skill,
        skillName: item.skillName,
        attempted: item.attempted,
        correct: item.correct,
        score: Math.round((item.correct / item.attempted) * 100),
      }));

      const totalQuestions = assessment.answers.length;
      const overallScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      // Identify strongest and weakest skills
      const sortedSkills = [...skillScores].sort((a, b) => b.score - a.score);
      const strongestSkills = sortedSkills.slice(0, 2).map((s) => s.skillName);
      const weakestSkills = sortedSkills.slice(-2).reverse().map((s) => s.skillName);

      const result = await AssessmentResult.create({
        assessment: assessment._id,
        user: req.user._id,
        careerName: assessment.careerName,
        overallScore,
        totalQuestions,
        correctCount: totalCorrect,
        incorrectCount: totalQuestions - totalCorrect,
        skillScores,
        strongestSkills,
        weakestSkills,
        completedAt: new Date(),
      });

      // Prepare answer review list with explanations
      const answerReview = assessment.answers.map((a) => ({
        question: a.question.question,
        options: a.question.options,
        selectedOption: a.selectedOption,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
        explanation: a.question.explanation,
        skillName: a.question.skill?.name || 'Core Skill',
      }));

      return res.status(200).json({
        success: true,
        result,
        answerReview,
      });
    }

    // In-memory fallback
    const memAssessment = inMemoryAssessments.find((a) => a._id === id || a.id === id);
    if (!memAssessment || memAssessment.user !== (req.user._id || req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assessment.',
      });
    }

    memAssessment.status = 'completed';
    memAssessment.completedAt = new Date();

    const skillMap = {};
    let totalCorrect = 0;

    memAssessment.answers.forEach((ans) => {
      const qObj = ans.qRef || inMemoryStore.questions.find((q) => q._id === ans.question);
      const skillName = qObj?.skillName || qObj?.skill?.name || 'Core Skill';

      if (ans.isCorrect) totalCorrect++;

      if (!skillMap[skillName]) {
        skillMap[skillName] = { skillName, attempted: 0, correct: 0 };
      }
      skillMap[skillName].attempted++;
      if (ans.isCorrect) skillMap[skillName].correct++;
    });

    const skillScores = Object.values(skillMap).map((item) => ({
      skillName: item.skillName,
      attempted: item.attempted,
      correct: item.correct,
      score: Math.round((item.correct / item.attempted) * 100),
    }));

    const totalQuestions = memAssessment.answers.length;
    const overallScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const sortedSkills = [...skillScores].sort((a, b) => b.score - a.score);
    const strongestSkills = sortedSkills.slice(0, 2).map((s) => s.skillName);
    const weakestSkills = sortedSkills.slice(-2).reverse().map((s) => s.skillName);

    const memResult = {
      _id: `res_${Date.now()}`,
      id: `res_${Date.now()}`,
      assessment: memAssessment._id,
      user: req.user._id || req.user.id,
      careerName: memAssessment.careerName,
      overallScore,
      totalQuestions,
      correctCount: totalCorrect,
      incorrectCount: totalQuestions - totalCorrect,
      skillScores,
      strongestSkills,
      weakestSkills,
      completedAt: new Date(),
    };

    inMemoryAssessmentResults.push(memResult);

    const answerReview = memAssessment.answers.map((a) => {
      const qObj = a.qRef || inMemoryStore.questions.find((q) => q._id === a.question);
      return {
        question: qObj?.question || 'Question Statement',
        options: qObj?.options || [],
        selectedOption: a.selectedOption,
        correctAnswer: qObj?.correctAnswer || 0,
        isCorrect: a.isCorrect,
        explanation: qObj?.explanation || 'Explanation text.',
        skillName: qObj?.skillName || 'Core Skill',
      };
    });

    res.status(200).json({
      success: true,
      result: memResult,
      answerReview,
    });
  } catch (error) {
    console.error('Error completing assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing assessment.',
    });
  }
};

// @desc    Get latest assessment result for authenticated student
// @route   GET /api/assessment/latest
// @access  Private
export const getLatestResult = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const result = await AssessmentResult.findOne({ user: req.user._id }).sort({ completedAt: -1 });
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'No completed assessment results found.',
        });
      }
      return res.status(200).json({
        success: true,
        result,
      });
    }

    // In-memory fallback
    const userResults = inMemoryAssessmentResults.filter((r) => r.user === (req.user._id || req.user.id));
    const result = userResults[userResults.length - 1];

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No completed assessment results found.',
      });
    }

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching latest result.',
    });
  }
};

// @desc    Get assessment attempt history for authenticated student
// @route   GET /api/assessment/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const history = await AssessmentResult.find({ user: req.user._id }).sort({ completedAt: -1 });
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    }

    // In-memory fallback
    const history = inMemoryAssessmentResults
      .filter((r) => r.user === (req.user._id || req.user.id))
      .reverse();

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching assessment history.',
    });
  }
};

// @desc    Get specific assessment details by ID
// @route   GET /api/assessment/:id
// @access  Private
export const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assessment ID.',
        });
      }

      const assessment = await Assessment.findById(id).populate({
        path: 'answers.question',
        select: '+correctAnswer +explanation',
        populate: { path: 'skill' },
      });

      if (!assessment || assessment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this assessment.',
        });
      }

      return res.status(200).json({
        success: true,
        data: assessment,
      });
    }

    // In-memory fallback
    const assessment = inMemoryAssessments.find((a) => a._id === id || a.id === id);
    if (!assessment || assessment.user !== (req.user._id || req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assessment.',
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching assessment details.',
    });
  }
};
