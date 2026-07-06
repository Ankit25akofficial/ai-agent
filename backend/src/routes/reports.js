const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { researchAndAnalyzeCompany } = require('../services/langchain');

/**
 * @route   POST /api/reports/research
 * @desc    Research a company, run LangChain analysis, save to database, and return results.
 * @access  Public
 */
router.post('/research', async (req, res) => {
  const { company } = req.body;

  if (!company || typeof company !== 'string' || company.trim() === '') {
    return res.status(400).json({ error: 'Company name is required.' });
  }

  try {
    console.log(`[API] Received research request for company: "${company}"`);
    
    // Call LangChain & Gemini service to gather research and run analysis
    const analysisResult = await researchAndAnalyzeCompany(company.trim());

    // Create a new report database entry
    const newReport = new Report({
      companyName: analysisResult.companyName,
      summary: analysisResult.summary,
      pros: analysisResult.pros,
      cons: analysisResult.cons,
      riskLevel: analysisResult.riskLevel,
      investmentScore: analysisResult.investmentScore,
      recommendation: analysisResult.recommendation,
      reasoning: analysisResult.reasoning,
      rawResearch: analysisResult.rawResearch
    });

    const savedReport = await newReport.save();
    console.log(`[API] Report saved successfully to MongoDB. ID: ${savedReport._id}`);
    
    return res.status(201).json(savedReport);
  } catch (error) {
    console.error(`[API Error in /research]:`, error);
    return res.status(500).json({ 
      error: 'An error occurred during the research process.',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/reports
 * @desc    Get all saved reports (summarized format for sidebar list).
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Select only fields needed for listing to optimize payload size
    const reports = await Report.find()
      .select('companyName recommendation investmentScore riskLevel createdAt')
      .sort({ createdAt: -1 });
    
    return res.json(reports);
  } catch (error) {
    console.error(`[API Error in GET /]:`, error);
    return res.status(500).json({ error: 'Failed to retrieve reports.' });
  }
});

/**
 * @route   GET /api/reports/:id
 * @desc    Get detailed report by MongoDB ID.
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    return res.json(report);
  } catch (error) {
    console.error(`[API Error in GET /:id]:`, error);
    return res.status(500).json({ error: 'Failed to retrieve the report.' });
  }
});

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a report by MongoDB ID.
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    console.log(`[API] Report deleted from MongoDB. ID: ${req.params.id}`);
    return res.json({ message: 'Report successfully deleted.' });
  } catch (error) {
    console.error(`[API Error in DELETE /:id]:`, error);
    return res.status(500).json({ error: 'Failed to delete the report.' });
  }
});

module.exports = router;
