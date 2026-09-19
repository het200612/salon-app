const { pool } = require('../config/db');

/**
 * GET /api/user/profile
 * Protected (requireUser).
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, Name, UserName, Email, PhoneNumber, Img, Usertype, Status FROM usermst WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    return res.json({
      id: user.id,
      name: user.Name,
      userName: user.UserName,
      email: user.Email,
      phoneNumber: user.PhoneNumber,
      img: user.Img,
      usertype: user.Usertype,
      status: user.Status,
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    return res.status(500).json({ message: 'Server error loading profile.' });
  }
}

/**
 * PUT /api/user/profile
 * Protected (requireUser + uploadSingle).
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, userName, email, phoneNumber } = req.body;

    if (!name || !userName || !email || !phoneNumber) {
      return res.status(400).json({ message: 'All profile fields are required.' });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    // Check if email already used by another user
    const [existing] = await pool.query('SELECT id FROM usermst WHERE Email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This email is already in use by another account.' });
    }

    const [currentUsers] = await pool.query('SELECT Img FROM usermst WHERE id = ?', [userId]);
    if (currentUsers.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const newImg = req.file ? req.file.filename : currentUsers[0].Img;

    await pool.query(
      'UPDATE usermst SET Name = ?, UserName = ?, Email = ?, PhoneNumber = ?, Img = ? WHERE id = ?',
      [name, userName, email, phoneNumber, newImg, userId]
    );

    return res.json({
      message: 'Profile updated successfully.',
      user: {
        id: userId,
        name,
        userName,
        email,
        phoneNumber,
        img: newImg,
      },
    });
  } catch (err) {
    console.error('Update user profile error:', err);
    return res.status(500).json({ message: 'Server error updating profile.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
