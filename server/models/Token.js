const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    tokenId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 100 },
    phone: { type: String, required: false, maxlength: 20 },
    status: { type: String, default: 'active', enum: ['active', 'used', 'expired'] },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date }
}, { timestamps: true });

// TTL index: automatically delete expired tokens after 30 days past expiry
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Token', tokenSchema);
