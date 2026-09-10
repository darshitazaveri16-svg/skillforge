import mongoose from 'mongoose';

const requiredSkillSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  targetLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 80,
  },
});

const careerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a career title'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a career description'],
      trim: true,
    },
    requiredSkills: [requiredSkillSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Career = mongoose.model('Career', careerSchema);

export default Career;
