server/
├── src/
│   ├── config/                  # Configuration files
│   │   ├── database.js          # MongoDB connection
│   │   ├── cloudinary.js        # Cloudinary setup
│   │   └── env.js               # Environment config
│   ├── controllers/             # Request handlers
│   │   ├── authController.js    # Auth logic
│   │   ├── auctionController.js # Auction logic
│   │   ├── bidController.js     # Bid logic
│   │   └── activityController.js # Activity logic
│   ├── routes/                  # API routes
│   │   ├── authRoutes.js
│   │   ├── auctionRoutes.js
│   │   ├── bidRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── uploadRoutes.js      # File upload routes
│   │   └── index.js             # Main router
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── logging.js           # Request logging
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Auction.js
│   │   ├── Bid.js
│   │   └── Activity.js
│   ├── utils/                   # Helper functions
│   │   ├── errorHandler.js
│   │   ├── validators.js
│   │   ├── jwt.js
│   │   ├── cloudinaryService.js
│   │   └── emailService.js
│   ├── services/                # Business logic
│   │   ├── authService.js
│   │   ├── auctionService.js
│   │   ├── bidService.js
│   │   └── activityService.js
│   └── app.js                   # Express app setup
├── server.js                    # Server entry point
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore
├── package.json                 # Dependencies
├── package-lock.json
├── README.md                    # Backend docs
└── STRUCTURE.md                 # This file

Core Files:
- server.js → Start the server
- src/app.js → Express app configuration
- src/config/ → All config files
- src/routes/ → API endpoint definitions
- src/controllers/ → Business logic for routes
- src/models/ → MongoDB schemas
- src/middleware/ → Express middleware
- src/utils/ → Helper functions
- src/services/ → Reusable services
