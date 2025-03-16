const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['HR', 'Candidate'],
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  profile: {
    mobile: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
