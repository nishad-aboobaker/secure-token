const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    totalTokenLimit: { type: Number, required: true, default: 1000 },
    totalGenerated: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Settings', settingsSchema);
