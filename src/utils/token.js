const jwt = require('jsonwebtoken');

const crypto = require('crypto');

function generateToken({ userId, tenantId, email, role, plan }) {
  return jwt.sign(
    { userId, tenantId, email, role, plan },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

module.exports = { generateToken, verifyToken, generateRefreshToken };
