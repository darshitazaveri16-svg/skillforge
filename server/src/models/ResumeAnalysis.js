import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    targetCareer: {
      type: String,
      required: [true, 'Target career name is required'],
      trim: true,
    },
    targetCareerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      default: null,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
      default: 'pdf',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    matchScore: {
      type: Number,
      required: [true, 'Resume match score is required'],
      min: 0,
      max: 100,
    },
    aiSuggestions: {
      summary: {
        type: String,
        default: '',
      },
      overallFeedback: {
        type: [String],
        default: [],
      },
      bulletSuggestions: {
        type: [String],
        default: [],
      },
      missingSkillsAdvice: {
        type: [String],
        default: [],
      },
      careerRecommendations: {
        type: [String],
        default: [],
      },
      isAiGenerated: {
        type: Boolean,
        default: false,
      },
      aiNotice: {
        type: String,
        default: null,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting and student retrieval
resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
