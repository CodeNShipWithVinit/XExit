const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getExitInterviews,
  getExitInterviewById,
  getExitInterviewByResignationId,
  addExitInterview,
  updateExitInterview,
  getResignationById,
  getResignationsByEmployeeId
} = require('../database');

const router = express.Router();

// POST /api/exit-interviews - Submit exit interview (Employee only)
router.post('/', authenticateToken, requireRole('Employee'), (req, res) => {
  try {
    const { resignationId, answers } = req.body;

    // Validate input
    if (!resignationId || !answers) {
      return res.status(400).json({ error: 'Resignation ID and answers are required' });
    }

    // Validate resignation exists and belongs to user
    const resignation = getResignationById(resignationId);
    if (!resignation) {
      return res.status(404).json({ error: 'Resignation not found' });
    }

    if (resignation.employeeId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if resignation is approved
    if (resignation.status !== 'Approved') {
      return res.status(400).json({ error: 'Exit interview can only be submitted for approved resignations' });
    }

    // Check if exit interview already exists
    const existingInterview = getExitInterviewByResignationId(resignationId);
    if (existingInterview) {
      return res.status(400).json({ error: 'Exit interview already submitted for this resignation' });
    }

    // Create exit interview
    const exitInterview = {
      id: uuidv4(),
      resignationId,
      employeeId: req.user.userId,
      employeeName: req.user.name,
      answers,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    addExitInterview(exitInterview);

    res.status(201).json(exitInterview);
  } catch (error) {
    console.error('Error submitting exit interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exit-interviews - Get exit interviews (HR: all, Employee: own)
router.get('/', authenticateToken, (req, res) => {
  try {
    let exitInterviews;

    if (req.user.role === 'HR') {
      // HR can see all exit interviews
      exitInterviews = getExitInterviews();
    } else {
      // Employees can only see their own exit interviews
      const userResignations = getResignationsByEmployeeId(req.user.userId);
      const resignationIds = userResignations.map(r => r.id);
      exitInterviews = getExitInterviews().filter(ei => 
        resignationIds.includes(ei.resignationId)
      );
    }

    res.json(exitInterviews);
  } catch (error) {
    console.error('Error fetching exit interviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exit-interviews/:id - Get specific exit interview
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const exitInterview = getExitInterviewById(req.params.id);

    if (!exitInterview) {
      return res.status(404).json({ error: 'Exit interview not found' });
    }

    // Check permissions
    if (req.user.role !== 'HR' && exitInterview.employeeId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(exitInterview);
  } catch (error) {
    console.error('Error fetching exit interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exit-interviews/resignation/:resignationId - Get exit interview by resignation ID
router.get('/resignation/:resignationId', authenticateToken, (req, res) => {
  try {
    const resignation = getResignationById(req.params.resignationId);
    
    if (!resignation) {
      return res.status(404).json({ error: 'Resignation not found' });
    }

    // Check permissions
    if (req.user.role !== 'HR' && resignation.employeeId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const exitInterview = getExitInterviewByResignationId(req.params.resignationId);

    if (!exitInterview) {
      return res.status(404).json({ error: 'Exit interview not found' });
    }

    res.json(exitInterview);
  } catch (error) {
    console.error('Error fetching exit interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/exit-interviews/:id/review - Mark exit interview as reviewed (HR only)
router.patch('/:id/review', authenticateToken, requireRole('HR'), (req, res) => {
  try {
    const exitInterview = getExitInterviewById(req.params.id);

    if (!exitInterview) {
      return res.status(404).json({ error: 'Exit interview not found' });
    }

    // Update exit interview
    const updatedExitInterview = updateExitInterview(req.params.id, {
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.userId
    });

    res.json(updatedExitInterview);
  } catch (error) {
    console.error('Error reviewing exit interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
