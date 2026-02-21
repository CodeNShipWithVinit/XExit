const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getResignations,
  getResignationById,
  getResignationsByEmployeeId,
  addResignation,
  updateResignation,
  getUserById
} = require('../database');
const HolidayService = require('../services/holidayService');
const EmailService = require('../services/emailService');

const router = express.Router();
const holidayService = new HolidayService(process.env.CALENDARIFIC_API_KEY);
const emailService = new EmailService();

// POST /api/resignations - Submit resignation request (Employee only)
router.post('/', authenticateToken, requireRole('Employee'), async (req, res) => {
  try {
    const { lastWorkingDay, reason } = req.body;

    // Validate input
    if (!lastWorkingDay || !reason) {
      return res.status(400).json({ error: 'Last working day and reason are required' });
    }

    // Validate date format and future date
    const lastWorkingDayDate = new Date(lastWorkingDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(lastWorkingDayDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (lastWorkingDayDate <= today) {
      return res.status(400).json({ error: 'Last working day must be in the future' });
    }

    // Check if date is valid (not weekend or holiday)
    const dateValidation = await holidayService.isValidResignationDate(
      lastWorkingDay,
      req.user.country
    );

    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.reason });
    }

    // Check if employee already has a pending resignation
    const existingResignations = getResignationsByEmployeeId(req.user.userId);
    const hasPending = existingResignations.some(r => r.status === 'Pending');
    
    if (hasPending) {
      return res.status(400).json({ error: 'You already have a pending resignation request' });
    }

    // Create resignation
    const resignation = {
      id: uuidv4(),
      employeeId: req.user.userId,
      employeeName: req.user.name,
      employeeEmail: req.user.email,
      lastWorkingDay,
      reason,
      status: 'Pending',
      exitDate: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    addResignation(resignation);

    // Send notification to HR
    await emailService.sendHRNotificationEmail({
      employeeName: req.user.name,
      lastWorkingDay,
      reason
    });

    res.status(201).json(resignation);
  } catch (error) {
    console.error('Error submitting resignation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/resignations - Get resignations (HR: all, Employee: own)
router.get('/', authenticateToken, (req, res) => {
  try {
    let resignations;

    if (req.user.role === 'HR') {
      // HR can see all resignations
      resignations = getResignations();
    } else {
      // Employees can only see their own resignations
      resignations = getResignationsByEmployeeId(req.user.userId);
    }

    res.json(resignations);
  } catch (error) {
    console.error('Error fetching resignations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/resignations/:id - Get specific resignation
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const resignation = getResignationById(req.params.id);

    if (!resignation) {
      return res.status(404).json({ error: 'Resignation not found' });
    }

    // Check permissions
    if (req.user.role !== 'HR' && resignation.employeeId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(resignation);
  } catch (error) {
    console.error('Error fetching resignation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/resignations/:id/approve - Approve resignation (HR only)
router.patch('/:id/approve', authenticateToken, requireRole('HR'), async (req, res) => {
  try {
    const { exitDate } = req.body;

    if (!exitDate) {
      return res.status(400).json({ error: 'Exit date is required' });
    }

    const resignation = getResignationById(req.params.id);

    if (!resignation) {
      return res.status(404).json({ error: 'Resignation not found' });
    }

    if (resignation.status !== 'Pending') {
      return res.status(400).json({ error: 'Resignation has already been reviewed' });
    }

    // Validate exit date
    const exitDateObj = new Date(exitDate);
    if (isNaN(exitDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid exit date format' });
    }

    // Update resignation
    const updatedResignation = updateResignation(req.params.id, {
      status: 'Approved',
      exitDate,
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
        exitDate
      );
    }

    res.json(updatedResignation);
  } catch (error) {
    console.error('Error approving resignation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/resignations/:id/reject - Reject resignation (HR only)
router.patch('/:id/reject', authenticateToken, requireRole('HR'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const resignation = getResignationById(req.params.id);

    if (!resignation) {
      return res.status(404).json({ error: 'Resignation not found' });
    }

    if (resignation.status !== 'Pending') {
      return res.status(400).json({ error: 'Resignation has already been reviewed' });
    }

    // Update resignation
    const updatedResignation = updateResignation(req.params.id, {
      status: 'Rejected',
      rejectionReason: rejectionReason || null,
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
        rejectionReason
      );
    }

    res.json(updatedResignation);
  } catch (error) {
    console.error('Error rejecting resignation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
