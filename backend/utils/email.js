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
  const subject = 'Salon Registration Approved - Complete Your Salon Details';
  const text = `Dear ${name},

We are pleased to inform you that your request to register your salon on **Hair Harmony** has been **approved**! 🎉

You can now log into your account and complete your salon registration by providing the necessary details.

### Next Steps:
1. **Log in** to your account at Hair Harmony.
2. Navigate to **Register Salon** in the dashboard.
3. Fill in your salon details and submit.

If you have any questions, feel free to reach out to our support team.

Welcome to **Hair Harmony** — we're excited to have you on board!

**Best regards,**
**Hair Harmony Team**`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #333333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <p style="font-size: 15px; margin-bottom: 16px;">Dear ${name},</p>
      <p style="font-size: 15px; margin-bottom: 16px;">
        We are pleased to inform you that your request to register your salon on <strong>Hair Harmony</strong> has been <strong>approved</strong>! 🎉
      </p>
      <p style="font-size: 15px; margin-bottom: 20px;">
        You can now log into your account and complete your salon registration by providing the necessary details.
      </p>
      <h3 style="font-size: 16px; color: #111111; margin-top: 24px; margin-bottom: 12px; font-weight: 700;">### Next Steps:</h3>
      <ol style="margin-left: 20px; padding-left: 5px; margin-bottom: 24px; font-size: 15px;">
        <li style="margin-bottom: 8px;"><strong>Log in</strong> to your account at Hair Harmony.</li>
        <li style="margin-bottom: 8px;">Navigate to <strong>Register Salon</strong> in the dashboard.</li>
        <li style="margin-bottom: 8px;">Fill in your salon details and submit.</li>
      </ol>
      <p style="font-size: 15px; margin-bottom: 16px;">
        If you have any questions, feel free to reach out to our support team.
      </p>
      <p style="font-size: 15px; margin-bottom: 24px;">
        Welcome to <strong>Hair Harmony</strong> — we're excited to have you on board!
      </p>
      <p style="font-size: 15px; margin-top: 24px;">
        <strong>Best regards,</strong><br/>
        <strong>Hair Harmony Team</strong>
      </p>
    </div>
  `;

  return sendMailSafely({ to: email, subject, html, text });
}

/**
 * 5. Salon owner registration rejected / declined
 */
async function sendSalonRejectionEmail(email, name, reason) {
  const subject = 'Salon Registration Declined - Hair Harmony';
  const reasonText = reason || 'Your Credentials are not genuine';
  const text = `Dear ${name},

Thank you for your interest in registering your salon on **Hair Harmony**.

After careful review, we regret to inform you that your **salon registration request has been declined**.

### Reason for Rejection:
${reasonText}

If you believe this decision was made in error or you would like to discuss it further, please feel free to contact our support team.

We appreciate your understanding and encourage you to apply again in the future.

**Best regards,**
**Hair Harmony Team**`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #333333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <p style="font-size: 15px; margin-bottom: 16px;">Dear ${name},</p>
      <p style="font-size: 15px; margin-bottom: 16px;">
        Thank you for your interest in registering your salon on <strong>Hair Harmony</strong>.
      </p>
      <p style="font-size: 15px; margin-bottom: 20px;">
        After careful review, we regret to inform you that your <strong>salon registration request has been declined</strong>.
      </p>
      <h3 style="font-size: 16px; color: #111111; margin-top: 24px; margin-bottom: 12px; font-weight: 700;">### Reason for Rejection:</h3>
      <p style="font-size: 15px; margin-bottom: 20px; color: #333333; padding: 10px 14px; background: #fdf2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
        ${reasonText}
      </p>
      <p style="font-size: 15px; margin-bottom: 16px;">
        If you believe this decision was made in error or you would like to discuss it further, please feel free to contact our support team.
      </p>
      <p style="font-size: 15px; margin-bottom: 24px;">
        We appreciate your understanding and encourage you to apply again in the future.
      </p>
      <p style="font-size: 15px; margin-top: 24px;">
        <strong>Best regards,</strong><br/>
        <strong>Hair Harmony Team</strong>
      </p>
    </div>
  `;

  return sendMailSafely({ to: email, subject, html, text });
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
