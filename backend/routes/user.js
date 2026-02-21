const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  addResignation,
  getResignationsByEmployeeId,
  getUserById
} = require('../database');
const HolidayService = require('../services/holidayService');
const EmailService = require('../services/emailService');

const router = express.Router();
const holidayService = new HolidayService(process.env.CALENDARIFIC_API_KEY);
const emailService = new EmailService();

// POST /api/user/resign - Submit resignation request (Employee only)
router.post('/resign', authenticateToken, requireRole('Employee'), async (req, res) => {
  try {
    const { lwd } = req.body;

    // Validate input
    if (!lwd) {
      return res.status(400).json({ error: 'Last working day (lwd) is required' });
    }

    // Validate date format and future date
    const lwdDate = new Date(lwd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(lwdDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (lwdDate <= today) {
      return res.status(400).json({ error: 'Last working day must be in the future' });
    }

    // Check if date is valid (not weekend or holiday)
    const dateValidation = await holidayService.isValidResignationDate(
      lwd,
      req.user.country
    );

    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.reason });
    }

    // Check if employee already has a pending resignation
    const existingResignations = getResignationsByEmployeeId(req.user.userId);
    const hasPending = existingResignations.some(r => r.status === 'pending');
    
    if (hasPending) {
      return res.status(400).json({ error: 'You already have a pending resignation request' });
    }

    // Create resignation
    const resignation = {
      _id: uuidv4(),
      id: uuidv4(), // Keep both for compatibility
      employeeId: req.user.userId,
      employeeName: req.user.name,
      employeeEmail: req.user.email,
      lwd,
      lastWorkingDay: lwd, // Keep both for compatibility
      reason: '', // Not required in this endpoint
      status: 'pending',
      exitDate: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    addResignation(resignation);

    // Send notification to HR
    await emailService.sendHRNotificationEmail({
      employeeName: req.user.name,
      lastWorkingDay: lwd,
      reason: 'Not specified'
    });

    res.status(200).json({
      data: {
        resignation: {
          _id: resignation._id
        }
      }
    });
  } catch (error) {
    console.error('Error submitting resignation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/responses - Submit exit questionnaire responses (Employee only)
router.post('/responses', authenticateToken, requireRole('Employee'), async (req, res) => {
  try {
    const { responses } = req.body;

    // Validate input
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses array is required' });
    }

    // Find an approved resignation for this employee
    const resignations = getResignationsByEmployeeId(req.user.userId);
    const approvedResignation = resignations.find(r => r.status === 'approved');

    if (!approvedResignation) {
      return res.status(400).json({ error: 'No approved resignation found. Complete resignation process first.' });
    }

    // Check if exit interview already exists
    const { getExitInterviewByResignationId, addExitInterview } = require('../database');
    const existingInterview = getExitInterviewByResignationId(approvedResignation._id || approvedResignation.id);
    
    if (existingInterview) {
      return res.status(400).json({ error: 'Exit interview already submitted for this resignation' });
    }

    // Create exit interview
    const exitInterview = {
      id: uuidv4(),
      _id: uuidv4(),
      resignationId: approvedResignation._id || approvedResignation.id,
      employeeId: req.user.userId,
      employeeName: req.user.name,
      responses: responses,
      answers: responses.reduce((acc, item, index) => {
        acc[`q${index + 1}`] = item.response;
        return acc;
      }, {}), // Keep both formats for compatibility
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    addExitInterview(exitInterview);

    res.status(200).json({
      message: 'Exit questionnaire submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting exit responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
