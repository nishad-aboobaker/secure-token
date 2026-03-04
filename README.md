# 🌙 Iftar Pass - Digital Food Distribution System

A premium, secure, and mobile-optimized system for managing Iftar food distribution at mosques. This application replaces physical tokens with digital QR passes to ensure fair and organized distribution.

## ✨ Features

- **📱 Single-Screen Experience**: Optimized UI for mobile-first usage, ensuring all critical actions fit on one screen without scrolling.
- **🛡️ Secure Verification**: Uses HMAC-signed tokens and JWT authentication for admin access.
- **🔍 Real-time Scanner**: High-performance QR scanner with instant results and a "Scan Next" flow for fast processing.
- **📊 Admin Dashboard**: Monitor available vs. issued passes and manage the total distribution limit in real-time.
- **☁️ Cloud Ready**: Fully integrated with MongoDB Atlas for reliable data storage.
- **💎 Premium Aesthetic**: Modern, glassmorphism-inspired design with smooth animations and high-contrast Islamic-themed accents.

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (Mongoose).
- **Scanner**: Html5-Qrcode.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js installed.
- MongoDB Atlas account.

### 2. Installation
Clone the repository and install dependencies in both folders:

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=3001
MONGODB_URI=your_mongodb_atlas_uri
HMAC_SECRET=your_random_string
JWT_SECRET=your_random_string
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_password
CLIENT_ORIGIN=http://localhost:5173
```

### 4. Running Locally
```bash
# Start Backend (from /server)
npm run dev

# Start Frontend (from /client)
npm run dev
```

## 🌍 Deployment

Refer to the [Step-by-Step Deployment Guide](./deployment_guide.md) for detailed instructions on hosting the backend on **Render/Railway** and the frontend on **Vercel**.

## 📄 License
ISC
