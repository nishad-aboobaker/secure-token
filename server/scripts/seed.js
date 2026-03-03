require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@nishad.me';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Only create admin if one does not already exist
        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await User.create({
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin user created successfully.');

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedAdmin();
