const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getResignations,
  getResignationById,
  updateResignation,
  getUserById,
  getExitInterviews
} = require('../database');
const EmailService = require('../services/emailService');

const router = express.Router();
const emailService = new EmailService();

// GET /api/admin/resignations - Get all resignations (Admin only)
router.get('/resignations', authenticateToken, requireRole('HR'), (req, res) => {
  try {
    const resignations = getResignations();
    
    // Format response as per requirements
    const formattedResignations = resignations.map(r => ({
      _id: r._id || r.id,
      employeeId: r.employeeId,
      lwd: r.lwd || r.lastWorkingDay,
      status: r.status
    }));

    res.status(200).json({
      data: formattedResignations
    });
  } catch (error) {
    console.error('Error fetching resignations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/conclude_resignation - Approve or reject resignation (Admin only)
router.put('/conclude_resignation', authenticateToken, requireRole('HR'), async (req, res) => {
  try {
    const { resignationId, approved, lwd } = req.body;

    if (!resignationId || typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'resignationId and approved (boolean) are required' });
    }

    const resignation = getResignationById(resignationId);

    if (!resignation) {
      return res.status(404).json({ error: 'Resignation not found' });
    }

    if (resignation.status !== 'pending') {
      return res.status(400).json({ error: 'Resignation has already been reviewed' });
    }

    let updatedResignation;

    if (approved) {
      // Approve resignation
      if (!lwd) {
        return res.status(400).json({ error: 'lwd (last working day) is required for approval' });
      }

      // Validate exit date
      const exitDateObj = new Date(lwd);
      if (isNaN(exitDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid lwd date format' });
      }

      updatedResignation = updateResignation(resignationId, {
        status: 'approved',
        exitDate: lwd,
        lwd: lwd,
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.user.userId
      });

      // Get employee details
      const employee = getUserById(resignation.employeeId);

      // Send approval email to employee
      if (employee) {
        await emailService.sendResignationApprovalEmail(
          employee.email,
          employee.name,
          lwd
        );
      }
    } else {
      // Reject resignation
      updatedResignation = updateResignation(resignationId, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.user.userId
      });

      // Get employee details
      const employee = getUserById(resignation.employeeId);

      // Send rejection email to employee
      if (employee) {
        await emailService.sendResignationRejectionEmail(
          employee.email,
          employee.name,
          'Your resignation request has been rejected'
        );
      }
    }

    res.status(200).json({
      message: approved ? 'Resignation approved successfully' : 'Resignation rejected successfully'
    });
  } catch (error) {
    console.error('Error concluding resignation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/exit_responses - Get all exit questionnaire responses (Admin only)
router.get('/exit_responses', authenticateToken, requireRole('HR'), (req, res) => {
  try {
    const exitInterviews = getExitInterviews();
    
    // Format response as per requirements
    const formattedResponses = exitInterviews.map(interview => ({
      employeeId: interview.employeeId,
      responses: interview.responses || Object.entries(interview.answers || {}).map(([key, value]) => ({
        questionText: `Question ${key}`,
        response: value
      }))
    }));

    res.status(200).json({
      data: formattedResponses
    });
  } catch (error) {
    console.error('Error fetching exit responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
