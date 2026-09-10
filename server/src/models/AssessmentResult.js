import mongoose from 'mongoose';

const skillScoreSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
  },
  skillName: {
    type: String,
    required: true,
  },
  attempted: {
    type: Number,
    required: true,
    default: 0,
  },
  correct: {
    type: Number,
    required: true,
    default: 0,
  },
  score: {
    type: Number,
    required: true,
    default: 0, // 0-100 percentage
  },
});

const assessmentResultSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    careerName: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true, // 0-100 percentage
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    incorrectCount: {
      type: Number,
      required: true,
    },
    skillScores: [skillScoreSchema],
    strongestSkills: [String],
    weakestSkills: [String],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

export default AssessmentResult;
