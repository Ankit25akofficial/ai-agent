const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  pros: [{
    type: String,
    required: true
  }],
  cons: [{
    type: String,
    required: true
  }],
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  investmentScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  recommendation: {
    type: String,
    enum: ['Invest', 'Pass'],
    required: true
  },
  reasoning: {
    type: String,
    required: true
  },
  rawResearch: {
    overview: String,
    news: [String],
    financials: String,
    sentiment: String,
    strengthsRisks: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
