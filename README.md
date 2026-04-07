# AuctionHub - Complete Setup & Getting Started

## 📋 Project Overview

**AuctionHub** is a full-stack live auction platform with:
- React + Vite frontend
- Node.js + Express backend  
- MongoDB database
- Cloudinary image hosting
- JWT authentication
- Real-time bidding

## 🚀 Quick Start

### Option 1: First Time Setup

#### Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials (MongoDB, Cloudinary, JWT secret)
npm run dev
# Server runs on http://localhost:5000
```

#### Frontend
```bash
cd auction_web
npm install
# Create .env file with:
# VITE_API_URL=http://localhost:5000
# VITE_CLOUDINARY_CLOUD_NAME=your_name
npm run dev
# Frontend runs on http://localhost:5173
```

### Option 2: Subsequent Runs
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd auction_web && npm run dev
```

## 📁 Project Structure

```
Auction-/
├── auction_web/          # React Frontend (Vite)
│   ├── src/
│   │   ├── api/          # Backend API calls
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── constants/    # App constants
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities
│   │   ├── data/         # Mock data
│   │   └── pages/        # Page components
│   ├── FRONTEND_SETUP.md # Frontend guide
│   └── package.json
│
├── server/               # Express Backend
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose schemas
│   │   ├── utils/        # Utilities
│   │   ├── services/     # Business logic
│   │   └── app.js        # Express app
│   ├── server.js         # Server entry
│   ├── README.md         # Backend guide
│   ├── .env.example      # Env template
│   └── package.json
│
├── FULL_PROJECT_STRUCTURE.md  # Complete structure doc
├── .gitignore            # Git ignore rules
└── README.md            # This file
```

## 🔧 Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Fetch API** - HTTP requests
- **React Context** - State management
- **CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image hosting

## 🔐 Environment Setup

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auctionhub
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_name
```

## 📚 Documentation

- **[FULL_PROJECT_STRUCTURE.md](./FULL_PROJECT_STRUCTURE.md)** - Detailed project structure
- **[server/README.md](./server/README.md)** - Backend API documentation
- **[auction_web/FRONTEND_SETUP.md](./auction_web/FRONTEND_SETUP.md)** - Frontend setup guide
- **[auction_web/BACKEND_FRONTEND_TASK_GUIDE.md](./auction_web/BACKEND_FRONTEND_TASK_GUIDE.md)** - Development tasks

## 🎯 Key Features

### User Features
- ✅ Register & Login (JWT)
- ✅ Browse active auctions
- ✅ Search & filter by category
- ✅ View auction details
- ✅ Place bids with validation
- ✅ Track bid history
- ✅ Activity feed
- ✅ Upload auction photos (Cloudinary)

### Technical Features
- ✅ MongoDB for data persistence
- ✅ Cloudinary for image storage
- ✅ JWT authentication
- ✅ RESTful API design
- ✅ Input validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `PUT /api/auth/profile` - Update profile

### Auctions
- `GET /api/auctions` - List all auctions
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions` - Create auction (protected)
- `PUT /api/auctions/:id` - Update auction (protected)
- `DELETE /api/auctions/:id` - Delete auction (protected)
- `GET /api/auctions/search` - Search auctions

### Bidding
- `POST /api/bids` - Place bid (protected)
- `GET /api/bids/auction/:id` - Get bid history
- `GET /api/bids/my-bids` - User's bids (protected)
- `POST /api/bids/validate` - Validate bid

### Activity
- `GET /api/activity` - Public activity feed
- `GET /api/activity/auction/:id` - Auction activity
- `GET /api/activity/my-activity` - User activity (protected)

## ⚙️ Database Models

### User
- name, email, password (hashed)
- avatar, bio, location, phone
- role (buyer/seller/admin)
- rating, totalBids, totalWins

### Auction
- title, subtitle, description
- category, condition
- startingPrice, currentBid, increment
- images (Cloudinary URLs)
- seller, currentBidder, winner
- status, endDate, bidCount

### Bid
- amount, auction ID, bidder ID
- status, timestamp

### Activity
- type (bid_placed, auction_won, etc.)
- user ID, auction ID
- description, metadata

## 🧪 Testing Workflows

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

### Get Auctions
```bash
curl http://localhost:5000/api/auctions
```

### Place Bid (with token)
```bash
curl -X POST http://localhost:5000/api/bids \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "auctionId": "auction_id",
    "bidAmount": 750
  }'
```

## ✅ Development Checklist

- [ ] MongoDB running locally or Atlas connected
- [ ] Cloudinary account created & credentials added
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can register/login user
- [ ] Can fetch auctions from database
- [ ] Can place bids
- [ ] Can upload images to Cloudinary
- [ ] Activity feed showing bids
- [ ] All components connected to APIs

## 🚨 Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection failed
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- For Atlas, verify IP whitelist

### Cloudinary upload fails
- Verify credentials in .env
- Check file size (max 10MB)
- Ensure correct cloud name

### CORS errors
- Backend has CORS enabled for port 5173
- Check FRONTEND_URL in backend .env

### JWT token errors
- Token might be expired
- Try logging out and back in
- Verify JWT_SECRET in .env

## 📦 Deployment

### Frontend
```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or hosting
```

### Backend
```bash
# Deploy to Heroku, Render, Railway, or similar
# Set environment variables in hosting platform
```

## 📝 Useful Commands

```bash
# Backend
cd server
npm install          # Install dependencies
npm run dev         # Start development server
npm start           # Start production server
npm run lint        # Run linter

# Frontend
cd auction_web
npm install         # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run linter
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB & Mongoose](https://mongoosejs.com/)
- [Cloudinary API](https://cloudinary.com/documentation)
- [JWT](https://jwt.io/)

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review API endpoint docs in server/README.md
3. Check browser console for errors
4. Check server logs for backend errors

## 📄 License

MIT

---

**Ready to build? Start with the backend setup, then frontend. Good luck! 🚀**
