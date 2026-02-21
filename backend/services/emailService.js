const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendResignationApprovalEmail(employeeEmail, employeeName, exitDate) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: employeeEmail,
      subject: 'Resignation Request Approved',
      html: `
        <h2>Resignation Request Approved</h2>
        <p>Dear ${employeeName},</p>
        <p>Your resignation request has been approved.</p>
        <p><strong>Exit Date:</strong> ${new Date(exitDate).toLocaleDateString()}</p>
        <p>You can now complete your exit interview questionnaire by logging into the system.</p>
        <p>Best regards,<br>HR Department</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Approval email sent to ${employeeEmail}`);
    } catch (error) {
      console.error('Error sending approval email:', error.message);
      // Don't throw error - email failure shouldn't block the approval
    }
  }

  async sendResignationRejectionEmail(employeeEmail, employeeName, rejectionReason) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: employeeEmail,
      subject: 'Resignation Request - Status Update',
      html: `
        <h2>Resignation Request Update</h2>
        <p>Dear ${employeeName},</p>
        <p>Your resignation request has been reviewed.</p>
        ${rejectionReason ? `<p><strong>Note:</strong> ${rejectionReason}</p>` : ''}
        <p>Please contact HR for further information.</p>
        <p>Best regards,<br>HR Department</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Rejection email sent to ${employeeEmail}`);
    } catch (error) {
      console.error('Error sending rejection email:', error.message);
    }
  }

  async sendHRNotificationEmail(resignationDetails) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to HR email
      subject: 'New Resignation Request',
      html: `
        <h2>New Resignation Request</h2>
        <p>A new resignation request has been submitted.</p>
        <p><strong>Employee:</strong> ${resignationDetails.employeeName}</p>
        <p><strong>Intended Last Working Day:</strong> ${new Date(resignationDetails.lastWorkingDay).toLocaleDateString()}</p>
        <p><strong>Reason:</strong> ${resignationDetails.reason}</p>
        <p>Please log in to the system to review and process this request.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('HR notification email sent');
    } catch (error) {
      console.error('Error sending HR notification:', error.message);
    }
  }
}

module.exports = EmailService;
