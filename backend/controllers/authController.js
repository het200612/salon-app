const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'hair_harmony_super_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper to compare passwords (supports bcrypt hash and plain text fallback for legacy/seed data)
 */
async function comparePasswords(plainPassword, storedPassword) {
  if (!plainPassword || !storedPassword) return false;
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
    return bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password, role, usertype } = req.body;
    const selectedRole = (role || usertype || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 1. Admin check (Hardcoded credentials matching original Django behavior)
    if (
      email.toLowerCase() === 'admin@gmail.com' &&
      password === 'Admin' &&
      (!selectedRole || selectedRole.toLowerCase() === 'admin')
    ) {
      const token = jwt.sign(
        { id: 0, email: 'admin@gmail.com', name: 'Admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return res.json({
        token,
        role: 'admin',
        user: { id: 0, name: 'Administrator', email: 'admin@gmail.com', role: 'admin' },
      });
    }

    // 2. Query user from database
    const [users] = await pool.query(
      'SELECT id, Name, UserName, Email, PhoneNumber, Password, Usertype, Status, Img FROM usermst WHERE Email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    const dbUser = users[0];
    const isPasswordValid = await comparePasswords(password, dbUser.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    const userTypeNormalized = dbUser.Usertype.toLowerCase();

    // 3. Owner role handling (Must have Status = 'verified')
    if (userTypeNormalized === 'owner') {
      if (selectedRole && selectedRole.toLowerCase() !== 'owner') {
        return res.status(401).json({ message: 'Invalid role selected for this account.' });
      }

      if (dbUser.Status !== 'verified') {
        if (dbUser.Status === 'rejected') {
          return res.status(403).json({ message: 'Your salon owner registration was rejected by the administrator.' });
        }
        return res.status(403).json({ message: 'Your salon owner registration is pending administrator approval.' });
      }

      const token = jwt.sign(
        { id: dbUser.id, email: dbUser.Email, name: dbUser.Name, role: 'owner' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        role: 'owner',
        user: {
          id: dbUser.id,
          name: dbUser.Name,
          userName: dbUser.UserName,
          email: dbUser.Email,
          phoneNumber: dbUser.PhoneNumber,
          usertype: dbUser.Usertype,
          status: dbUser.Status,
          img: dbUser.Img,
        },
      });
    }

    // 4. Regular User handling
    if (selectedRole && selectedRole.toLowerCase() !== 'user' && selectedRole.toLowerCase() !== '') {
      return res.status(401).json({ message: 'Invalid role selected for this account.' });
    }

    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.Email, name: dbUser.Name, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      role: 'user',
      user: {
        id: dbUser.id,
        name: dbUser.Name,
        userName: dbUser.UserName,
        email: dbUser.Email,
        phoneNumber: dbUser.PhoneNumber,
        usertype: dbUser.Usertype,
        status: dbUser.Status,
        img: dbUser.Img,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, userName, email, phoneNumber, password, usertype } = req.body;
    const profileImg = req.file ? req.file.filename : 'default.jpg';

    // Required fields check
    if (!name || !userName || !email || !phoneNumber || !password || !usertype) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Phone number validation: 10 numeric digits
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    // Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
      });
    }

    // Duplicate email check
    const [existingUsers] = await pool.query('SELECT id FROM usermst WHERE Email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Normalize user type ('Owner' or 'User')
    const formattedUserType = usertype.toLowerCase() === 'owner' ? 'Owner' : 'User';
    const initialStatus = formattedUserType === 'Owner' ? 'pending' : 'verified';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO usermst (Name, UserName, Email, PhoneNumber, Password, Usertype, Status, Img)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, userName, email, phoneNumber, hashedPassword, formattedUserType, initialStatus, profileImg]
    );

    // Send welcome email in background
    sendWelcomeEmail(email, name).catch((err) => console.error('Welcome email error:', err));

    return res.status(201).json({
      message: formattedUserType === 'Owner'
        ? 'Owner registration submitted! Your account is pending administrator approval before you can log in.'
        : 'Registration successful! You can now log in.',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
}

/**
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const [users] = await pool.query('SELECT id, Name, Email FROM usermst WHERE Email = ?', [email]);
    if (users.length > 0) {
      const user = users[0];
      const resetToken = crypto.randomBytes(25).toString('hex');

      await pool.query('UPDATE usermst SET password_reset_token = ? WHERE id = ?', [resetToken, user.id]);
      sendPasswordResetEmail(user, resetToken).catch((err) => console.error('Password reset email error:', err));
    }

    // Always respond with success to prevent user email enumeration
    return res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error processing password reset.' });
  }
}

/**
 * POST /api/auth/reset-password/:token
 */
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword, password } = req.body;
    const candidatePassword = newPassword || password;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required.' });
    }

    if (!candidatePassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    if (confirmPassword && candidatePassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(candidatePassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
      });
    }

    const [users] = await pool.query(
      'SELECT id, Name, Email FROM usermst WHERE password_reset_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(candidatePassword, 10);

    await pool.query(
      'UPDATE usermst SET Password = ?, password_reset_token = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    sendPasswordChangedEmail(user).catch((err) => console.error('Password changed email error:', err));

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error resetting password.' });
  }
}

/**
 * POST /api/auth/change-password
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
      });
    }

    const [users] = await pool.query('SELECT id, Name, Email, Password FROM usermst WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    const isOldPasswordValid = await comparePasswords(oldPassword, user.Password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE usermst SET Password = ? WHERE id = ?', [hashedPassword, userId]);

    sendPasswordChangedEmail(user).catch((err) => console.error('Password changed email error:', err));

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Server error changing password.' });
  }
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
};
