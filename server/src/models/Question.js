import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide question text'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please provide 4 multiple choice options'],
      validate: [
        (arr) => Array.isArray(arr) && arr.length === 4,
        'Questions must have exactly 4 options',
      ],
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Please specify the correct option index (0-3)'],
      min: 0,
      max: 3,
      select: false, // Omitted by default for security
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Please specify associated skill'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please specify difficulty level'],
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    explanation: {
      type: String,
      required: [true, 'Please provide an explanation'],
      trim: true,
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

const Question = mongoose.model('Question', questionSchema);

export default Question;
