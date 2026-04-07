# AuctionHub Frontend

Modern React + Vite frontend for the AuctionHub auction platform.

## Technologies

- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Page navigation (install separately)
- **Fetch API** - HTTP requests to backend
- **Context API** - State management

## Project Structure

```
frontend/
├── src/
│   ├── components/                    # Reusable React components
│   │   ├── common/                    # Common/shared components
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── auction/                   # Auction-related components
│   │   │   ├── AuctionCard.jsx
│   │   │   ├── AuctionList.jsx
│   │   │   ├── AuctionDetail.jsx
│   │   │   ├── BidForm.jsx
│   │   │   ├── ActivityFeed.jsx
│   │   │   └── Sidebar.jsx
│   │   └── auth/                      # Authentication components
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       └── ProtectedRoute.jsx
│   ├── pages/                         # Full page components
│   │   ├── home/
│   │   │   └── HomePage.jsx
│   │   ├── auction/
│   │   │   └── AuctionDetailPage.jsx
│   │   └── profile/
│   │       ├── ProfilePage.jsx
│   │       └── MyBidsPage.jsx
│   ├── api/                           # API service layer
│   │   ├── index.js                   # Base API configuration
│   │   ├── auth.js                    # Authentication endpoints
│   │   ├── auctions.js                # Auction endpoints
│   │   ├── bids.js                    # Bidding endpoints
│   │   ├── activity.js                # Activity feed endpoints
│   │   └── uploads.js                 # File upload service
│   ├── store/                         # React Context providers
│   │   ├── AuthContext.jsx            # Authentication state
│   │   └── AuctionContext.jsx         # Auction state
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFetchAuctions.js
│   │   └── useForm.js
│   ├── services/                      # Business logic
│   │   ├── auctionService.js
│   │   └── bidService.js
│   ├── utils/                         # Utility functions
│   │   └── format.js
│   ├── styles/                        # CSS stylesheets
│   │   ├── index.css                  # Global styles
│   │   ├── components.css
│   │   └── pages.css
│   ├── constants/                     # App constants
│   │   ├── categories.js
│   │   └── config.js
│   ├── data/                          # Mock data (temporary)
│   │   ├── auctions.js
│   │   ├── activity.js
│   │   └── filters.js
│   ├── public/                        # Static assets
│   ├── App.jsx                        # Root component
│   └── main.jsx                       # Entry point
├── .env                               # Environment variables (create from .env.example)
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── index.html                         # HTML entry point
├── vite.config.js                     # Vite configuration
├── eslint.config.js                   # ESLint configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your values:
```
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

## Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Architecture

### API Layer (`src/api/`)
Centralized API service with automatic token injection. All API calls go through `src/api/index.js` which handles:
- Base URL configuration
- JWT token injection in headers
- Error handling
- Request/response intercepting

### Components (`src/components/`)
- **common/** - Shared UI components (Header, Footer, etc.)
- **auction/** - Auction-specific components (AuctionCard, BidForm, etc.)
- **auth/** - Authentication components (Login, Register, etc.)

### Pages (`src/pages/`)
Full-page components that combine multiple components. Each page handles:
- Page-level state
- Route parameters
- Data fetching

### State Management (`src/store/`)
React Context API for:
- **AuthContext** - User authentication, login, logout
- **AuctionContext** - Auction data, filters, search

### Custom Hooks (`src/hooks/`)
Reusable hook logic:
- **useAuth** - Auth state and operations
- **useFetchAuctions** - Pagination and filtering
- **useForm** - Form handling and validation

## API Endpoints

The frontend communicates with the backend REST API:

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Auctions
- `GET /api/auctions` - Get all auctions (with pagination)
- `GET /api/auctions/search` - Search auctions
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction

### Bids
- `POST /api/bids` - Place bid
- `GET /api/bids/history/:auctionId` - Get bid history
- `GET /api/bids/my-bids` - Get user's bids

### Activity
- `GET /api/activity/feed` - Get public activity
- `GET /api/activity/user/:userId` - Get user's activity

## Environment Variables

Create a `.env` file with:

```
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

- `VITE_API_URL` - Backend API base URL
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for image uploads

## Common Tasks

### Add a new page
1. Create component in `src/pages/{category}/{PageName}.jsx`
2. Import in `src/App.jsx`
3. Add route in App.jsx

### Add a new component
1. Create component in `src/components/{category}/{ComponentName}.jsx`
2. Create related CSS in `src/styles/`
3. Import and use in parent component

### Add API endpoint call
1. Add function in appropriate file in `src/api/`
2. Use in component via custom hook or directly
3. Handle loading/error states

## Troubleshooting

### npm run dev fails
- Check that backend is running on `http://localhost:5000`
- Verify `.env` file exists and variables are set
- Check browser console for error messages

### API calls not working
- Ensure backend server is running
- Check `VITE_API_URL` in `.env` is correct
- Check networking tab in browser DevTools

### Styles not loading
- Verify CSS files are imported in components
- Check file paths are correct relative to component location
- Clear browser cache if styles seem outdated

## For Backend Setup

See the [backend README](../server/README.md) for server setup instructions.
│   ├── models/                        # Mongoose schemas
│   │   ├── User.js
│   │   ├── Auction.js
│   │   ├── Bid.js
│   │   └── Activity.js
│   ├── config/
│   │   └── mongodb.js                 # MongoDB connection setup
│   └── README.md                      # Database setup guide
├── vite.config.js
├── package.json
├── BACKEND_FRONTEND_TASK_GUIDE.md    # Development roadmap
└── README.md                          # This file
```

## Frontend Setup

### Install Dependencies
```bash
cd auction_web
npm install
```

### Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default).

### Build for Production
```bash
npm build
```

### Key Features
- **React Components**: Clean, modular component structure with shared state
- **Authentication**: JWT-based login via `AuthProvider` context
- **Auction Management**: Browse, bid, and view auction details
- **Image Upload**: Cloudinary integration for auction photos
- **Activity Feed**: Real-time activity updates (bids, new items)
- **Responsive Design**: CSS modules for styling

### Frontend API Integration
The `src/api/` folder contains all backend API calls:
- **auth.js** - Login, logout, registration
- **auctions.js** - Fetch auctions, create, update, delete
- **bids.js** - Place bids, validate increments
- **activity.js** - Fetch recent activity
- **uploads.js** - Upload images to Cloudinary

See [src/api/index.js](./src/api/index.js) for base configuration.

## Database Setup

MongoDB schemas are located in [database/models/](./database/models/):
- **User** - User accounts, credentials, profile info
- **Auction** - Auction items, photos, pricing, timeline
- **Bid** - Individual bids, bidder info, timestamps
- **Activity** - Feed items (bids, wins, listings)

See [database/README.md](./database/README.md) for schema details and setup instructions.

## Environment Variables

### Frontend (.env in auction_web/ root)
```
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Backend (.env in backend/ root)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auctionhub
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Development Workflow

1. **Start Backend** - Run the Node.js/Express server on port 5000
2. **Start Frontend** - Run Vite server on port 5173
3. **Replace Mock Data** - Update `src/App.jsx` to fetch from backend API instead of local data files
4. **Connect Components** - Wire `Nav`, `AuctionList`, `AuctionDetail`, `Sidebar` to API calls
5. **Test E2E** - Verify login, auction browsing, bidding, and image uploads work

## Technologies

- **Frontend**: React 19, Vite 7
- **Backend**: Node.js, Express (to be created)
- **Database**: MongoDB, Mongoose (schemas in database/)
- **Storage**: Cloudinary (image hosting)
- **Auth**: JWT tokens
- **Styling**: CSS modules

## Next Steps

1. Create backend server folder with Express setup
2. Set up MongoDB connection (see database/config/)
3. Implement authentication API (login, register)
4. Build auction CRUD endpoints
5. Add Cloudinary file upload handling
6. Connect frontend to backend API calls
7. Test bidding workflow end-to-end

**Detailed tasks**: See [BACKEND_FRONTEND_TASK_GUIDE.md](./BACKEND_FRONTEND_TASK_GUIDE.md)
