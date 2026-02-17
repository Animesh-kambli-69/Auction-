# Auction Web Application - File Structure

## Project Organization

The application has been refactored into a clean, modular structure with separated concerns:

```
src/
├── components/           # React components
│   ├── Header.jsx       # Top navigation/branding
│   ├── Header.css
│   ├── Hero.jsx         # Hero section with stats
│   ├── Hero.css
│   ├── AuctionCard.jsx  # Individual auction card
│   ├── AuctionCard.css
│   ├── AuctionList.jsx  # Grid of auction cards
│   ├── AuctionList.css
│   ├── AuctionDetail.jsx # Detail view with bidding
│   ├── AuctionDetail.css
│   ├── ActivityFeed.jsx # Activity feed component
│   ├── ActivityFeed.css
│   ├── Sidebar.jsx      # Sidebar with highlights
│   └── Sidebar.css
│
├── data/                # Initial data
│   ├── auctions.js      # Auction items data
│   └── activity.js      # Activity feed data
│
├── utils/               # Utility functions
│   └── format.js        # Currency and time formatting
│
├── App.jsx              # Main app component
├── App.css              # App-level styles
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Component Breakdown

### **Header** (`components/Header.jsx`)
- Displays branding and live statistics
- Props: `stats`, `totalBids`

### **Hero** (`components/Hero.jsx`)
- Hero section with call-to-action and room pulse
- Props: `stats`, `now`

### **AuctionList** (`components/AuctionList.jsx`)
- Grid of all active auctions
- Props: `auctions`, `now`, `selectedId`, `onSelectAuction`

### **AuctionCard** (`components/AuctionCard.jsx`)
- Individual auction card with category, time, and current bid
- Props: `auction`, `now`, `isActive`, `onClick`

### **AuctionDetail** (`components/AuctionDetail.jsx`)
- Detailed view of selected auction with bidding form
- Props: `auction`, `now`, `bidInput`, `bidError`, `onBidInputChange`, `onBidSubmit`

### **Sidebar** (`components/Sidebar.jsx`)
- Room highlights and activity feed
- Props: `auctions`, `stats`, `activity`

### **ActivityFeed** (`components/ActivityFeed.jsx`)
- List of recent activity items
- Props: `activity`

## Utility Functions (`utils/format.js`)

- **`currency`** - Intl.NumberFormat for USD formatting
- **`formatTime(endAt, now)`** - Formats countdown timer (HH:MM:SS)

## Data Files

- **`data/auctions.js`** - Initial auction items with details
- **`data/activity.js`** - Initial activity feed items

## Running the Application

```bash
cd auction_web
npm install
npm run dev
```

## Benefits of This Structure

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Components can be easily reused or modified
3. **Maintainability** - Easy to locate and update specific features
4. **Scalability** - Simple to add new components or features
5. **Testability** - Individual components can be tested in isolation
