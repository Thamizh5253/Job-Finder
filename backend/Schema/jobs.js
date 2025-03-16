// MongoDB Schema (Mongoose)
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  postedBy: { type: String, required: true },
  company_name: { type: String, required: true },
  candidates: [
    {
      candidateId: { type: String },
      score: { type: Number },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Jobs', jobSchema);