# Frontend Project Structure

## Current Organization (Updated)

```
frontend/
├── src/
│   ├── components/                    # Reusable React components organized by feature
│   │   ├── auction/                   # Auction-related components (8 files)
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── ActivityFeed.css
│   │   │   ├── AuctionCard.jsx
│   │   │   ├── AuctionCard.css
│   │   │   ├── AuctionDetail.jsx
│   │   │   ├── AuctionDetail.css
│   │   │   ├── AuctionList.jsx
│   │   │   └── AuctionList.css
│   │   ├── common/                    # Shared/common components (8 files)
│   │   │   ├── Header.jsx
│   │   │   ├── Header.css
│   │   │   ├── Hero.jsx
│   │   │   ├── Hero.css
│   │   │   ├── Navigation.jsx
│   │   │   ├── Navigation.css
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   └── auth/                      # Authentication components (2 files)
│   │       ├── Login.jsx
│   │       └── Login.css
│   │
│   ├── pages/                         # Full-page components
│   │   ├── home/
│   │   │   └── HomePage.jsx           # Main auction browsing page
│   │   ├── auction/
│   │   │   ├── AuctionDetailPage.jsx
│   │   │   └── AuctionDetailPage.css
│   │   └── profile/
│   │       └── ProfilePage.jsx        # User profile page
│   │
│   ├── api/                           # API service layer
│   │   ├── index.js                   # Base API configuration
│   │   ├── auth.js                    # Auth endpoints
│   │   ├── auctions.js                # Auction CRUD endpoints
│   │   ├── bids.js                    # Bidding endpoints
│   │   ├── activity.js                # Activity feed endpoints
│   │   └── uploads.js                 # Cloudinary upload service
│   │
│   ├── store/                         # React Context state management
│   │   ├── AuthContext.jsx            # Authentication context
│   │   └── AuctionContext.jsx         # Auction filtering & pagination context
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFetchAuctions.js
│   │   └── useForm.js
│   │
│   ├── services/                      # Business logic services (non-API)
│   │   ├── auctionService.js
│   │   └── bidService.js
│   │
│   ├── utils/                         # Utility functions
│   │   └── format.js                  # Currency and time formatting
│   │
│   ├── constants/                     # App-wide constants
│   │   ├── categories.js              # Auction categories
│   │   └── config.js                  # App configuration
│   │
│   ├── data/                          # Mock/sample data (temporary)
│   │   ├── auctions.js
│   │   ├── activity.js
│   │   └── filters.js
│   │
│   ├── styles/                        # Global stylesheets
│   │   ├── index.css                  # Global styles
│   │   ├── components.css             # Component-specific styles
│   │   └── pages.css                  # Page-specific styles
│   │
│   ├── assets/                        # Static assets (images, icons, etc.)
│   │
│   ├── App.jsx                        # Root component
│   ├── App.css                        # App-level styles
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Page styles
│
├── public/                            # Static files served at root
├── .env                               # Environment variables (not in git)
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── index.html                         # HTML entry point
├── vite.config.js                     # Vite configuration
├── eslint.config.js                   # ESLint configuration
├── package.json                       # Dependencies & scripts
├── package-lock.json
├── README.md                          # Frontend documentation
├── STRUCTURE.md                       # This file
└── node_modules/                      # Dependencies (not in git)
```

## Component Organization Strategy

### `/components/auction/` - Auction Feature Components
Components specifically related to auction display and management:
- **ActivityFeed** - Shows recent bid activity
- **AuctionCard** - Single auction card in list view
- **AuctionDetail** - Full auction details and bidding form
- **AuctionList** - Grid/list of auctions

### `/components/common/` - Shared Components
Reusable components used across multiple features:
- **Header** - Top navigation bar with branding
- **Hero** - Hero section with key statistics
- **Navigation** - Navigation menu and auth UI (formerly nav.jsx)
- **Sidebar** - Room highlights and statistics panel

### `/components/auth/` - Authentication Components
Components for user authentication:
- **Login** - Login/signup modal

## State Management

### Context API
- **AuthContext** (`/store/AuthContext.jsx`) - User login state, profile data
- **AuctionContext** (`/store/AuctionContext.jsx`) - Auction list, filters, pagination

## API Layer

All backend API calls go through `/api/` service files:
- `index.js` - Base API client with token injection
- `auth.js` - User registration, login, profile
- `auctions.js` - Get, create, update, delete auctions
- `bids.js` - Place bids, get bid history
- `activity.js` - Get activity feed
- `uploads.js` - Upload images to Cloudinary

## Page Structure

### Home Page (`pages/home/HomePage.jsx`)
Main page showing:
- Active auctions list
- Individual auction details
- Bid placement
- Activity feed
- Room statistics

### Auction Detail Page (`pages/auction/AuctionDetailPage.jsx`)
Detailed view of single auction with full bid history and timeline.

### Profile Page (`pages/profile/ProfilePage.jsx`)
User profile showing:
- User information
- Bidding statistics
- Listings management
- Profile editing

## Import Paths

All imports are relative to `/src/` directory:
- Components: `import Header from '../../components/common/Header'`
- Utils: `import { currency } from '../../utils/format'`
- API: `import * as authApi from '../../api/auth'`
- Store: `import { useAuth } from '../../store/AuthContext'`

## Key Files to Know

| File | Purpose |
|------|---------|
| `App.jsx` | Root component, main layout |
| `main.jsx` | React app entry point |
| `api/index.js` | API client configuration |
| `store/AuthContext.jsx` | User authentication state |
| `store/AuctionContext.jsx` | Auction data and filters state |
| `components/common/Navigation.jsx` | Main navigation & auth modal |
| `pages/home/HomePage.jsx` | Primary user interface |

## Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```
│   │   ├── validators.js
│   │   └── axios.js
│   ├── styles/                  # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── mixins.css
│   ├── assets/                  # Images, icons
│   │   ├── images/
│   │   └── icons/
│   ├── data/                    # Mock data
│   │   ├── auctions.js
│   │   ├── activity.js
│   │   └── filters.js
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Root component
│   └── index.css                # Global styles
├── public/                      # Static assets
├── .env.example                 # Env template
├── .gitignore                   # Git ignore
├── eslint.config.js             # ESLint config
├── vite.config.js               # Vite config
├── package.json                 # Dependencies
├── package-lock.json
└── README.md                    # Frontend docs

Key Directories:
- components/ → UI components (shared & feature-specific)
- pages/ → Full page components
- api/ → Backend API service layer
- hooks/ → Custom React hooks
- store/ → Context/state management
- services/ → Business logic
- constants/ → App-wide constants
- utils/ → Helper functions
- styles/ → CSS files
