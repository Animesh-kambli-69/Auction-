# Database Setup Guide

This folder contains MongoDB schemas and configuration for the AuctionHub application.

## Files Overview

### `/config/mongodb.js`
Handles MongoDB connection and disconnection. Configure your MongoDB URI in environment variables.

**Usage:**
```javascript
const { connectDB } = require('./config/mongodb');

// In your server entry point
connectDB();
```

### `/models/User.js`
User schema with:
- Authentication (email, password with bcrypt hashing)
- Profile information (name, avatar, bio, location)
- Role-based access (buyer, seller, admin)
- Tracking stats (bids, wins, listings)

### `/models/Auction.js`
Auction schema with:
- Auction details (title, description, category, condition)
- Pricing (starting price, reserve, current bid, increment)
- Timeline (start date, end date)
- Images (stored via Cloudinary)
- Status tracking (active, ended, cancelled)
- Seller and winner references

### `/models/Bid.js`
Bid schema with:
- Bid amount and auction reference
- Bidder information
- Status tracking (active, outbid, won, cancelled)
- Validation for minimum bid increments

### `/models/Activity.js`
Activity feed schema with:
- Activity types (bid placed, auction won, auction created, etc.)
- User and auction references
- Description and metadata
- Public/private visibility
- Timestamps for chronological ordering

## Setup Instructions

### 1. Install Required Packages

```bash
npm install mongoose bcryptjs
```

### 2. Configure Environment Variables

Add to your `.env` file in the backend root:

```env
MONGODB_URI=mongodb://localhost:27017/auctionhub
```

For MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auctionhub?retryWrites=true&w=majority
```

### 3. Initialize Database Connection

In your Express server (e.g., `server.js` or `app.js`):

```javascript
const express = require('express');
const { connectDB } = require('./database/config/mongodb');

const app = express();

// Connect to MongoDB before starting server
connectDB();

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### 4. Import Models in Your Routes

```javascript
const User = require('./database/models/User');
const Auction = require('./database/models/Auction');
const Bid = require('./database/models/Bid');
const Activity = require('./database/models/Activity');

// Use in route handlers
app.get('/api/auctions', async (req, res) => {
  const auctions = await Auction.find().populate('seller');
  res.json(auctions);
});
```

## Schema Relationships

```
User
  ├── creates many Auctions (1-to-many)
  ├── places many Bids (1-to-many)
  └── appears in Activity logs (1-to-many)

Auction
  ├── belongs to User (seller) (many-to-1)
  ├── has many Bids (1-to-many)
  ├── has many Activity entries (1-to-many)
  └── has images (embedded documents)

Bid
  ├── belongs to User (bidder) (many-to-1)
  ├── belongs to Auction (many-to-1)
  └── creates Activity entry
```

## Key Features

### Password Hashing
User passwords are automatically hashed using bcrypt before saving:
```javascript
const user = new User({ email: 'test@example.com', password: 'secret123' });
// Password is automatically hashed via pre-save middleware
await user.save();

// Compare password on login
const isMatch = await user.comparePassword('secret123');
```

### Auction Status Management
Check if auction is active and end auctions:
```javascript
const auction = await Auction.findById(id);
if (auction.isActive()) {
  console.log('Auction is still running');
}

// End auction and assign winner
await auction.endAuction();
```

### Activity Logging
Log user actions automatically:
```javascript
const Activity = require('./database/models/Activity');

await Activity.logActivity(
  'bid_placed',
  userId,
  auctionId,
  `placed a bid on ${auction.title}`,
  { bidAmount: 1500 }
);
```

### Indexes for Performance
All models include indexes on frequently queried fields:
- **User**: email (unique), createdAt
- **Auction**: category, status, seller, endDate
- **Bid**: auction, bidder, isHighest
- **Activity**: type, user, auction, isPublic (all with timestamps)

## Common Queries

### Get Active Auctions
```javascript
const activeAuctions = await Auction.find({ status: 'active' })
  .populate('seller', 'name avatar')
  .sort({ endDate: 1 });
```

### Get User's Bids
```javascript
const userBids = await Bid.find({ bidder: userId })
  .populate('auction', 'title currentBid')
  .sort({ createdAt: -1 });
```

### Get Recent Activity
```javascript
const recentActivity = await Activity.find({ isPublic: true })
  .populate('user', 'name avatar')
  .populate('auction', 'title')
  .sort({ createdAt: -1 })
  .limit(20);
```

## Data Validation

Each schema includes validation rules:
- **Email**: Must be valid format and unique
- **Password**: Minimum 6 characters (enforced server-side)
- **Auction title**: 5-150 characters
- **Bid amount**: Must be >= minimum required bid
- **Dates**: endDate must be in the future for active auctions

## Next Steps

1. Verify MongoDB is running locally or ensure Atlas credentials are correct
2. Test database connection with a simple query
3. Seed initial data (auctions, user accounts) for testing
4. Build API routes that use these models (see backend task guide)
5. Connect frontend API calls to these endpoints

## Tips

- Always `.populate()` references when fetching data (e.g., `.populate('seller')`)
- Use `.select()` to exclude sensitive fields like passwords: `.select('-password')`
- Add pagination with `.limit()` and `.skip()` for large result sets
- Create database indexes during development to optimize queries
