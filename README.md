# AuctionHub

AuctionHub is a full-stack auction platform with live bidding, user authentication, listing approvals, watchlist support, and seller reviews.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Realtime: Socket.IO
- Media: Cloudinary

## Project Layout

```text
Auction-/
  backend/      Express API + MongoDB models
  frontend/     React app (Vite)
  README.md     This file
```

## Prerequisites

Install these before setup:

1. Node.js 18+ and npm
2. MongoDB (local) OR MongoDB Atlas URI
3. Cloudinary account (for image uploads)

## Installation (First Time)

### 1) Clone and open the project

```bash
git clone <your-repository-url>
cd Auction-
```

### 2) Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 3) Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4) Configure backend environment

Create backend/.env from backend/.env.example.

Linux/macOS:

```bash
cd backend
cp .env.example .env
```

Windows PowerShell:

```powershell
Set-Location backend
Copy-Item .env.example .env
```

Edit backend/.env and set real values:

- MONGODB_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- CLOUDINARY_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- FRONTEND_URL (or FRONTEND_URLS)

### 5) Configure frontend environment

Create frontend/.env from frontend/.env.example.

Linux/macOS:

```bash
cd frontend
cp .env.example .env
```

Windows PowerShell:

```powershell
Set-Location frontend
Copy-Item .env.example .env
```

Edit frontend/.env:

- VITE_API_URL=http://localhost:5000
- VITE_CLOUDINARY_CLOUD_NAME=<your_cloud_name>

## Optional: Seed Test Data

Run this once to create sample users and auctions:

```bash
cd backend
node seed.js
```

Sample users from seeding:

- seller@example.com / password123
- buyer@example.com / password123
- superadmin@example.com / password123

## Run the App

Use two terminals.

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

Default URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Build for Production

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm start
```

## Common Commands

Backend:

```bash
npm run dev
npm start
npm run lint
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Troubleshooting

### 1) ERR_CONNECTION_REFUSED from frontend

Cause: backend is not running.

Fix:

1. Start backend from the backend folder.
2. Confirm health URL: http://localhost:5000/api/health.

### 2) Port already in use

If you see port conflicts:

- Backend on 5000 already in use
- Frontend on 5173 already in use

Fix options:

1. Stop old Node processes using those ports.
2. Or run frontend on a different port.
3. If frontend is not on 5173, update backend/.env with FRONTEND_URLS to include that port.

Example:

```env
FRONTEND_URLS=http://localhost:5173,http://localhost:5174
```

### 3) CORS blocked origin

Cause: frontend origin is missing from backend allowed origins.

Fix:

1. Update backend/.env FRONTEND_URL or FRONTEND_URLS.
2. Restart backend.

### 4) MongoDB connection errors

1. Ensure MongoDB service is running (local), or
2. Verify Atlas URI and IP whitelist.

### 5) Cloudinary upload errors

1. Verify CLOUDINARY_NAME/API_KEY/API_SECRET in backend/.env.
2. Verify VITE_CLOUDINARY_CLOUD_NAME in frontend/.env.

## API Overview

Core endpoints:

- Auth: /api/auth/*
- Auctions: /api/auctions/*
- Bids: /api/bids/*
- Activity: /api/activity/*
- Watchlist: /api/watchlist/*
- Reviews: /api/reviews/*
- Admin: /api/admin/*

Detailed API docs:

- backend/README.md
- frontend/README.md

## License

MIT
