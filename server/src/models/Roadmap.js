import mongoose from 'mongoose';

const roadmapItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    required: true,
  },
  gap: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  estimatedDuration: {
    type: String,
    default: '4 hours',
  },
  description: {
    type: String,
    required: true,
  },
  resourceTitle: {
    type: String,
    required: true,
  },
  resourceUrl: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
    },
    careerName: {
      type: String,
      required: true,
    },
    readinessScore: {
      type: Number,
      default: 0,
    },
    items: [roadmapItemSchema],
    progress: {
      type: Number,
      default: 0, // 0-100 percentage of completed items
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;
