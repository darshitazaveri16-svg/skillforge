import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a skill name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a skill category'],
      enum: ['Frontend', 'Backend', 'Database', 'Data Analysis', 'Security', 'Core', 'DevOps', 'Testing'],
      default: 'Core',
    },
    description: {
      type: String,
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

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
