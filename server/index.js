require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const tokensRoutes = require('./routes/tokensRoutes');
const authRoutes = require('./routes/authRoutes');
const Settings = require('./models/Settings');
const { seedAdmin } = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 3001;

//pingpong
app.get('/ping', (req, res) => {
  const start = process.hrtime.bigint();

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  const end = process.hrtime.bigint();
  const responseTimeMs = Number(end - start) / 1_000_000;

  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTimeMs.toFixed(3)}ms`,
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    memory: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
    nodeVersion: process.version,
    platform: process.platform,
    cpuUsage: process.cpuUsage(),
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

        // Initialize settings if not exists
        const settings = await Settings.findOne();
        if (!settings) {
            await Settings.create({
                totalTokenLimit: parseInt(process.env.ADMIN_TOKEN_LIMIT) || 1000,
                totalGenerated: 0
            });
            console.log('Default settings initialized');
        }

        // Run Admin Seeder
        await seedAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
