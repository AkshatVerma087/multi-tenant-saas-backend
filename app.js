require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const projectRoutes = require('./src/routes/projects');
const authRoutes = require('./src/routes/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  const logger = require('./src/utils/logger');
  logger.error(err, '[Error] Unhandled Exception');
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
