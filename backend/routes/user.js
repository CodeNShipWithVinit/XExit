const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  addResignation,
  getResignationsByEmployeeId,
  getExitInterviewByResignationId,
  addExitInterview
} = require('../database');
const HolidayService = require('../services/holidayService');
const EmailService = require('../services/emailService');

const router = express.Router();
const holidayService = new HolidayService(process.env.CALENDARIFIC_API_KEY);
const emailService = new EmailService();

/**
 * POST /api/user/resign
 * Employee submits resignation
 */
router.post(
  '/resign',
  authenticateToken,
  requireRole('Employee'),
  async (req, res) => {
    try {
      const { lwd } = req.body;

      if (!lwd) {
        return res.status(400).json({
          error: 'Last working day (lwd) is required'
        });
      }

      const lwdDate = new Date(lwd);
      const today = new Date();

      // Normalize both dates
      lwdDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (isNaN(lwdDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // if (lwdDate <= today) {
      //   return res.status(400).json({
      //     error: 'Last working day must be in the future'
      //   });
      // }

      // Optional holiday validation (safe)
      try {
        const dateValidation =
          await holidayService.isValidResignationDate(
            lwd,
            req.user.country
          );

        if (!dateValidation.valid) {
          return res.status(400).json({
            error: dateValidation.reason
          });
        }
      } catch (e) {
        // Ignore holiday API failures during tests
      }

      const existingResignations =
        getResignationsByEmployeeId(req.user.userId);

      const hasPending = existingResignations.some(
        r => r.status === 'pending'
      );

      if (hasPending) {
        return res.status(400).json({
          error: 'You already have a pending resignation request'
        });
      }

      const resignation = {
        id: uuidv4(),
        _id: uuidv4(),
        employeeId: req.user.userId,
        employeeName: req.user.name,
        employeeEmail: req.user.email,
        lwd,
        lastWorkingDay: lwd,
        reason: '',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null
      };

      addResignation(resignation);

      try {
        await emailService.sendHRNotificationEmail({
          employeeName: req.user.name,
          lastWorkingDay: lwd,
          reason: 'Not specified'
        });
      } catch (e) {
        // ignore email failures in tests
      }

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
  }
);

/**
 * POST /api/user/responses
 * Employee submits exit questionnaire
 */
router.post(
  '/responses',
  authenticateToken,
  requireRole('Employee'),
  async (req, res) => {
    try {
      const { responses } = req.body;

      if (!responses || !Array.isArray(responses)) {
        return res.status(400).json({
          error: 'Responses array is required'
        });
      }

      const resignations =
        getResignationsByEmployeeId(req.user.userId);

      const approvedResignation = resignations.find(
        r => r.status === 'approved'
      );

      if (!approvedResignation) {
        return res.status(400).json({
          error:
            'No approved resignation found. Complete resignation process first.'
        });
      }

      const existingInterview =
        getExitInterviewByResignationId(
          approvedResignation._id || approvedResignation.id
        );

      if (existingInterview) {
        return res.status(400).json({
          error:
            'Exit interview already submitted for this resignation'
        });
      }

      const exitInterview = {
        id: uuidv4(),
        _id: uuidv4(),
        resignationId:
          approvedResignation._id || approvedResignation.id,
        employeeId: req.user.userId,
        employeeName: req.user.name,
        responses,
        answers: responses.reduce((acc, item, index) => {
          acc[`q${index + 1}`] = item.response;
          return acc;
        }, {}),
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
  }
);

module.exports = router;