require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');
const tokensRoutes = require('./routes/tokensRoutes');
const authRoutes = require('./routes/authRoutes');
const Settings = require('./models/Settings');
const { seedAdmin } = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 3001;

// pingpong
app.get('/ping', async (req, res) => {
  const start = process.hrtime.bigint();

  // DB ping
  let dbStatus = 'disconnected';
  let dbPingTime = null;
  try {
    const dbStart = process.hrtime.bigint();
    await mongoose.connection.db.admin().ping();
    dbPingTime = `${(Number(process.hrtime.bigint() - dbStart) / 1_000_000).toFixed(3)}ms`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  // External services check
  let geminiStatus = 'unknown';
  try {
    const geminiRes = await fetch('https://generativelanguage.googleapis.com', { method: 'HEAD' });
    geminiStatus = geminiRes.ok ? 'ok' : 'degraded';
  } catch {
    geminiStatus = 'unreachable';
  }

  // Memory
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const heapPercent = Math.round((heapUsedMB / heapTotalMB) * 100);

  // Overall health
  const isHealthy =
    dbStatus === 'connected' &&
    geminiStatus !== 'unreachable' &&
    heapPercent < 80;

  const responseTimeMs = (Number(process.hrtime.bigint() - start) / 1_000_000).toFixed(3);

  res.status(200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    message: 'pong',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTimeMs}ms`,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',

    database: {
      status: dbStatus,
      pingTime: dbPingTime,
      activeConnections: mongoose.connection.pool?.size ?? null,
    },

    memory: {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      heapUsedPercent: `${heapPercent}%`,
      rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
    },

    system: {
      nodeVersion: process.version,
      platform: process.platform,
      loadAverage: os.loadavg(),
      cpuUsage: process.cpuUsage(),
    },

    services: {
      geminiApi: geminiStatus,
    },
  });
});

// Validate required env vars at startup
const requiredEnvVars = ['HMAC_SECRET', 'JWT_SECRET', 'MONGODB_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/tokens', tokensRoutes);
app.use('/api/auth', authRoutes);

// Database Connection & Initialization
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
        totalTokenLimit: parseInt(process.env.ADMIN_TOKEN_LIMIT) || 1000,
        totalGenerated: 0
      });
      console.log('Default settings initialized');
    }

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
