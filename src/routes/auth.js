const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../utils/token');
const userRepo = require('../repositories/userRepo');
const tenantRepo = require('../repositories/tenantRepo');
const tokenRepo = require('../repositories/tokenRepo');

const router = express.Router();

// POST /api/auth/register
// Registers a new tenant and an initial admin user
router.post('/register', async (req, res, next) => {
  try {
    const { companyName, email, password } = req.body;

    // Basic validation
    if (!companyName || !email || !password) {
      return res.status(400).json({ error: 'companyName, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await userRepo.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create tenant
    const tenant = await tenantRepo.createTenant(companyName, 'free');

    // Create user (TenantAdmin)
    const user = await userRepo.createUser({
      tenantId: tenant.id,
      email,
      passwordHash,
      role: 'TenantAdmin'
    });

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: user.role,
      plan: tenant.plan
    });

    const refreshToken = generateRefreshToken();
    await tokenRepo.saveRefreshToken(user.id, refreshToken);

    res.status(201).json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await userRepo.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      plan: user.plan
    });

    const refreshToken = generateRefreshToken();
    await tokenRepo.saveRefreshToken(user.id, refreshToken);

    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

    const storedToken = await tokenRepo.getRefreshToken(refreshToken);
    if (!storedToken) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    // Generate new access token
    const accessToken = generateToken({
      userId: storedToken.user_id,
      tenantId: storedToken.tenant_id,
      email: storedToken.email,
      role: storedToken.role,
      plan: storedToken.plan
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
