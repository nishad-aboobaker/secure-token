const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@nishad.me';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Only create admin if one does not already exist — never overwrite
        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping seed.');
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await User.create({
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Default admin user created.');
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

module.exports = { seedAdmin };
