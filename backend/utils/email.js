const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter using environment variables.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_USE_TLS === 'true' ? false : false, // 587 uses STARTTLS
  auth: {
    user: process.env.EMAIL_HOST_USER || '',
    pass: process.env.EMAIL_HOST_PASSWORD || '',
  },
});

/**
 * Helper to safely send email with console fallback in development.
 */
async function sendMailSafely({ to, subject, html, text }) {
  if (!process.env.EMAIL_HOST_USER || process.env.EMAIL_HOST_USER === 'your_email@gmail.com') {
    console.log(`\n📨 [Email Simulation] To: ${to}\nSubject: ${subject}\nContent:\n${text || html}\n`);
    return { simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Hair Harmony" <${process.env.EMAIL_HOST_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    });
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    // Do not throw so business logic doesn't crash on email failure
    return null;
  }
}

/**
 * 1. Welcome registration email
 */
async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to Hair Harmony!';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #D4AF37;">Welcome to Hair Harmony, ${name}!</h2>
      <p>Thank you for registering with us. We're excited to have you join our grooming community.</p>
      <p>You can now log in and explore top-rated salons, discover premium services, and book appointments effortlessly.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Hair Harmony Team &copy; ${new Date().getFullYear()}</p>
    </div>
  `;
  return sendMailSafely({ to: email, subject, html, text: `Welcome to Hair Harmony, ${name}!` });
}

/**
 * 2. Password changed confirmation
 */
async function sendPasswordChangedEmail(user) {
  const email = typeof user === 'string' ? user : user.Email || user.email;
  const name = typeof user === 'object' ? user.Name || user.name || 'User' : 'User';
  const subject = 'Your Hair Harmony Password Has Been Changed';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h3 style="color: #D4AF37;">Password Update Notification</h3>
      <p>Hello ${name},</p>
      <p>Your account password was recently updated. If you did not make this change, please contact our support team immediately.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Hair Harmony Security Team</p>
    </div>
  `;
  return sendMailSafely({ to: email, subject, html, text: `Hello ${name}, your password was changed.` });
}

/**
 * 3. Password reset link email
 */
async function sendPasswordResetEmail(user, token) {
  const email = typeof user === 'string' ? user : user.Email || user.email;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password/${token}`;
  const subject = 'Password Reset Request — Hair Harmony';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #D4AF37;">Hair Harmony Password Reset</h2>
      <p>You requested a password reset for your Hair Harmony account.</p>
      <p>Please click the button below to set a new password:</p>
      <p style="margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #D4AF37; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </p>
      <p>Or copy this link to your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Hair Harmony Team</p>
    </div>
  `;
  return sendMailSafely({ to: email, subject, html, text: `Reset link: ${resetLink}` });
}

/**
 * 4. Salon owner registration approved
 */
async function sendSalonApprovalEmail(email, name) {
  const subject = 'Salon Registration Approved — Hair Harmony';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #10B981;">Congratulations ${name}!</h2>
      <p>Your salon owner registration has been approved by the administrator.</p>
      <p>You can now log in to your <strong>Hair Harmony Owner Dashboard</strong> to set up your salon profile, add services, upload gallery photos, and manage appointments.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Hair Harmony Team</p>
    </div>
  `;
  return sendMailSafely({ to: email, subject, html, text: `Your salon owner account has been approved!` });
}

/**
 * 5. Salon owner registration rejected
 */
async function sendSalonRejectionEmail(email, name, reason) {
  const subject = 'Salon Registration Update — Hair Harmony';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #EF4444;">Salon Registration Update</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your interest in Hair Harmony. Unfortunately, your owner registration request could not be approved at this time.</p>
      <blockquote style="border-left: 4px solid #EF4444; padding-left: 15px; margin: 15px 0; color: #555;">
        <strong>Reason:</strong> ${reason || 'Details could not be verified'}
      </blockquote>
      <p>You may contact our support team or register again with verified documentation.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Hair Harmony Team</p>
    </div>
  `;
  return sendMailSafely({ to: email, subject, html, text: `Salon request rejected. Reason: ${reason}` });
}

/**
 * 6. Appointment Confirmation
 */
async function sendAppointmentConfirmationEmail(toEmail, userName, salonName, serviceName, date, slot) {
  const subject = `Appointment Confirmed: ${salonName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #10B981;">Appointment Confirmed!</h2>
      <p>Dear ${userName},</p>
      <p>Your appointment at <strong>${salonName}</strong> has been accepted by the owner.</p>
      <table style="width: 100%; max-width: 400px; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Salon:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${salonName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${serviceName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${date}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Time Slot:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${slot}</td></tr>
      </table>
      <p>Please arrive 10 minutes prior to your time slot. Thank you for choosing Hair Harmony!</p>
    </div>
  `;
  return sendMailSafely({ to: toEmail, subject, html, text: `Your appointment at ${salonName} on ${date} (${slot}) is confirmed.` });
}

/**
 * 7. Appointment Rejection
 */
async function sendAppointmentRejectionEmail(toEmail, userName, salonName, serviceName, date, slot, reason) {
  const subject = `Appointment Update: ${salonName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #EF4444;">Appointment Cancelled</h2>
      <p>Dear ${userName},</p>
      <p>Unfortunately, your appointment request for <strong>${serviceName}</strong> at <strong>${salonName}</strong> on <strong>${date} (${slot})</strong> could not be accommodated.</p>
      <p><strong>Reason:</strong> ${reason || 'Time slot unavailable'}</p>
      <p>Please feel free to choose another available time slot or salon on Hair Harmony.</p>
    </div>
  `;
  return sendMailSafely({ to: toEmail, subject, html, text: `Your appointment at ${salonName} on ${date} was rejected. Reason: ${reason}` });
}

/**
 * 8. Password reset confirmation
 */
async function sendPasswordChangeConfirmationEmail(user) {
  return sendPasswordChangedEmail(user);
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendSalonApprovalEmail,
  sendSalonRejectionEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentRejectionEmail,
  sendPasswordChangeConfirmationEmail,
};
