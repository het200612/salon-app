const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hair_harmony_super_secret_key_change_in_production';

/**
 * Middleware to verify JWT token from Authorization header.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format. Format must be: Bearer <token>' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

/**
 * Middleware to require Admin role.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
  }
  next();
}

/**
 * Middleware to require User role.
 */
function requireUser(req, res, next) {
  if (!req.user || (req.user.role !== 'user' && req.user.role !== 'User')) {
    return res.status(403).json({ message: 'Forbidden. User privileges required.' });
  }
  next();
}

/**
 * Middleware to require Owner role.
 */
function requireOwner(req, res, next) {
  if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'Owner')) {
    return res.status(403).json({ message: 'Forbidden. Salon Owner privileges required.' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireUser,
  requireOwner,
};
