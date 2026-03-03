const Token = require('../models/Token');
const Settings = require('../models/Settings');
const crypto = require('crypto');

const hmacSecret = process.env.HMAC_SECRET;
if (!hmacSecret) {
    console.error('FATAL: HMAC_SECRET environment variable is not set.');
    process.exit(1);
}

// Simple in-memory rate limiter for token generation
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 tokens per IP per minute

const checkRateLimit = (ip) => {
    const now = Date.now();
    const entry = rateLimiter.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
        rateLimiter.set(ip, { windowStart: now, count: 1 });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
};

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimiter) {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
            rateLimiter.delete(ip);
        }
    }
}, 5 * 60 * 1000);

const generateSignature = (tokenId) => {
    return crypto
        .createHmac('sha256', hmacSecret)
        .update(tokenId)
        .digest('hex');
};

exports.getStats = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        const usedCount = await Token.countDocuments({ status: 'used' });
        res.json({
            totalLimit: settings?.totalTokenLimit || 0,
            totalGenerated: settings?.totalGenerated || 0,
            totalUsed: usedCount,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

exports.generateToken = async (req, res) => {
    try {
        // Rate limiting
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({ message: 'Too many requests. Please try again later.' });
        }

        const { name, phone } = req.body;

        // Input validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
            return res.status(400).json({ message: 'Name is required and must be 2-100 characters.' });
        }

        if (phone && (typeof phone !== 'string' || !/^[\d\s\+\-\(\)]{7,20}$/.test(phone))) {
            return res.status(400).json({ message: 'Invalid phone number format.' });
        }

        // Atomic update to check limit and increment count
        const settings = await Settings.findOneAndUpdate(
            { $expr: { $lt: ['$totalGenerated', '$totalTokenLimit'] } },
            { $inc: { totalGenerated: 1 } },
            { returnDocument: 'after' }
        );

        if (!settings) {
            return res.status(400).json({ message: 'Token limit reached. No more tokens available.' });
        }

        const tokenId = crypto.randomBytes(16).toString('hex');
        const signature = generateSignature(tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newToken = await Token.create({
            tokenId,
            name: name.trim(),
            phone: phone?.trim() || undefined,
            expiresAt,
        });

        res.json({
            tokenId: newToken.tokenId,
            signature,
            expiresAt: newToken.expiresAt,
        });
    } catch (err) {
        console.error('Token generation error:', err);
        res.status(500).json({ message: 'Failed to generate token' });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const { token: tokenString } = req.body;

        if (!tokenString || typeof tokenString !== 'string') {
            return res.status(400).json({ message: 'Token string is required' });
        }

        const [tokenId, signature] = tokenString.split('.');

        if (!tokenId || !signature) {
            return res.status(400).json({ message: 'Invalid QR format' });
        }

        // 1. Verify Signature Integrity
        const expectedSignature = generateSignature(tokenId);
        if (signature !== expectedSignature) {
            return res.status(400).json({ message: 'Token validation failed: Tampered or Forged' });
        }

        // 2. Find in DB
        const token = await Token.findOne({ tokenId });
        if (!token) {
            return res.status(404).json({ message: 'Token not found' });
        }

        // 3. Check status
        if (token.status === 'used') {
            return res.status(400).json({ message: 'Token already used on ' + token.usedAt });
        }
        if (token.status === 'expired' || new Date() > token.expiresAt) {
            token.status = 'expired';
            await token.save();
            return res.status(400).json({ message: 'Token has expired' });
        }

        // 4. Atomic Mark as Used
        const updatedToken = await Token.findOneAndUpdate(
            { tokenId, status: 'active' },
            { status: 'used', usedAt: new Date() },
            { returnDocument: 'after' }
        );

        if (!updatedToken) {
            return res.status(400).json({ message: 'Token could not be verified (possibly already processed)' });
        }

        res.json({
            message: 'Token verified successfully',
            user: {
                name: updatedToken.name,
            },
        });
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ message: 'Verification failed' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { totalTokenLimit } = req.body;

        if (totalTokenLimit === undefined || typeof totalTokenLimit !== 'number' || totalTokenLimit < 0 || !Number.isInteger(totalTokenLimit)) {
            return res.status(400).json({ message: 'Invalid token limit. Must be a non-negative integer.' });
        }

        const settings = await Settings.findOneAndUpdate(
            {},
            { totalTokenLimit },
            { returnDocument: 'after', upsert: true }
        );

        res.json({
            message: 'Settings updated successfully',
            totalLimit: settings.totalTokenLimit
        });
    } catch (err) {
        console.error('Settings update error:', err);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};

exports.resetStats = async (req, res) => {
    try {
        // 1. Reset generated count in Settings
        await Settings.findOneAndUpdate({}, { totalGenerated: 0 }, { upsert: true });

        // 2. Clear all tokens
        await Token.deleteMany({});

        res.json({ message: 'Usage statistics and tokens have been reset successfully' });
    } catch (err) {
        console.error('Reset error:', err);
        res.status(500).json({ message: 'Failed to reset statistics' });
    }
};

exports.getAllTokens = async (req, res) => {
    try {
        const { status } = req.query; // optional filter: 'active', 'used', 'expired'
        const filter = status ? { status } : {};

        const tokens = await Token.find(filter)
            .sort({ createdAt: -1 }) // Most recent first
            .limit(100); // Limit to 100 for performance on mobile

        res.json(tokens);
    } catch (err) {
        console.error('Fetch tokens error:', err);
        res.status(500).json({ message: 'Failed to fetch token logs' });
    }
};


