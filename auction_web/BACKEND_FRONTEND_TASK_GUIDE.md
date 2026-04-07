# Auction Web Task Guide

This guide breaks the project into step-by-step backend and frontend tasks, with MongoDB used for persistence and Cloudinary used for photo storage. It is written to match the current React structure so the components can connect cleanly once the API is ready.

## 1) Goal

Build an auction platform where:
- Users can sign up, log in, and place bids.
- Auction items are stored in MongoDB.
- Auction photos are uploaded to Cloudinary.
- The React UI reads live data from the backend instead of local mock files.
- Components stay connected through shared state, props, and API calls.

## 2) Current Frontend Flow

The app already has a connected component structure:
- `src/main.jsx` wraps the app in `AuthProvider` and renders `Nav` plus `App`.
- `src/components/nav bar/nav.jsx` manages auth state, search, filters, and login modal visibility.
- `src/App.jsx` controls the main auction experience.
- `src/components/Header.jsx`, `Hero.jsx`, `Auctioninfo/AuctionList.jsx`, `Auctioninfo/AuctionDetail.jsx`, and `Sidebar.jsx` render the auction dashboard.
- `src/pages/AuctionDetailPage.jsx` is the detail-page view when `viewMode` changes.
- `src/data/auctions.js` and `src/data/activity.js` currently provide mock data.

That means the next step is not rebuilding the UI from scratch. The next step is replacing local mock data with backend data and wiring each component to the same source of truth.

## 3) Backend Task Plan

### Step 1: Create the server folder
- Add a backend folder, for example `server/` or `backend/`.
- Initialize a Node.js project.
- Install the backend dependencies.

Suggested packages:
- `mongoose`

- `cloudinary`
### Step 2: Configure environment variables
- Add a `.env` file for the backend.
- Store MongoDB, JWT, and Cloudinary credentials there.

Example variables:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Step 3: Connect MongoDB
- Create a database connection module.
- Make the server connect before listening.
- Add basic error handling for failed connections.

### Step 4: Define MongoDB models
Create the core schemas first:
- `User` for authentication and profile data.
- `Auction` for item title, description, category, reserve price, current bid, increment, end time, image URLs, seller, and status.
- `Bid` if you want bid history separated from the auction document.
- `Activity` for recent auction events.

Minimum auction fields to support the current UI:
- `title`
- `subtitle`
- `currentBid`
- `bids`
- `endAt`
- `category`
- `condition`
- `reserve`
- `increment`
- `bidders`
- `location`
- `accent`
- `images`

### Step 5: Set up Cloudinary upload flow
- Configure Cloudinary in the backend.
- Accept image uploads through `multer`.
- Upload files to Cloudinary and store the returned image URL and public ID in MongoDB.
- Use Cloudinary for all auction photos, not local file storage.

Recommended flow:
1. Frontend selects a file.
2. Frontend sends the file to the backend.
3. Backend uploads the file to Cloudinary.
4. Backend stores the Cloudinary URL in the auction document.
5. Frontend renders that URL in the auction card and detail views.

### Step 6: Build auth APIs
Create authentication routes for:
- Register
- Login
- Logout if needed on the client side
- Get current user profile

Use JWT-based auth so the frontend can keep the user session and protect bidding actions.

### Step 7: Build auction APIs
Create REST endpoints for:
- Get all auctions
- Get auction by ID
- Create auction
- Update auction
- Delete auction
- Upload auction images
- Search and filter auctions by category, status, or keyword

### Step 8: Build bidding APIs
Add bid-specific endpoints or a bid sub-route:
- Place a bid on an auction
- Validate minimum bid increment
- Reject bids after auction end time
- Record bid history
- Update current bid and bid count atomically

This should be handled on the server, not only in React state, so the business rules stay consistent.

### Step 9: Build activity APIs
- Return recent activity for the sidebar feed.
- Create activity entries when users bid, win, or create auctions.
- Sort by newest first.

### Step 10: Add middleware and validation
- Add auth middleware for protected routes.
- Validate auction and bid payloads before writing to MongoDB.
- Handle errors consistently with a shared error handler.

### Step 11: Test backend endpoints
- Test auth with Postman or Insomnia.
- Test auction creation with Cloudinary uploads.
- Test bidding rules.
- Confirm MongoDB documents update correctly.

## 4) Frontend Task Plan

### Step 1: Add an API service layer
- Create a small client utility for `fetch` or `axios`.
- Centralize all backend calls in one place.
- Keep components focused on UI, not request logic.

Suggested frontend API modules:
- `src/api/auth.js`
- `src/api/auctions.js`
- `src/api/bids.js`
- `src/api/uploads.js`
- `src/api/activity.js`

### Step 2: Replace local mock data
- Remove direct dependence on `src/data/auctions.js` and `src/data/activity.js` once the backend is live.
- Use backend responses as the source of truth.
- Keep fallback mock data only if you want a development fallback.

### Step 3: Connect auth to the backend
- Update the login modal in `src/components/nav bar/Login.jsx` to call the auth API.
- Store the JWT or session token securely in the frontend.
- Feed login state back into `AuthProvider`.
- Make logout clear both frontend state and stored credentials.

### Step 4: Connect the auction list
- `AuctionList` should render backend auction data.
- `AuctionCard` should show the backend image URL from Cloudinary.
- Clicking a card should update the selected auction and, if needed, route to detail view.

### Step 5: Connect the detail view
- `AuctionDetail` and `AuctionDetailPage` should request the selected auction from the backend if it is not already loaded.
- The current bid form should submit to the bid API.
- After a successful bid, refresh the auction and activity feed.

### Step 6: Connect the sidebar feed
- `Sidebar` and `ActivityFeed` should read live activity data from the backend.
- New bids should appear in the feed without manual refresh.

### Step 7: Support image upload UI
- Add a create/edit auction form for sellers or admins.
- Let users select multiple photos.
- Send selected files to the backend upload endpoint.
- Show Cloudinary previews after upload.

### Step 8: Add loading and error states
- Show loading placeholders while auctions and activity are fetching.
- Show error messages when the backend is unavailable.
- Prevent bid submission while a request is already pending.

### Step 9: Keep component connections clean
- Keep `AuthProvider` at the top level.
- Pass only needed props from `App` to child components.
- Move shared server data into a single state source in `App` or a dedicated context/store.
- Make sure `Nav`, `Header`, `Hero`, `AuctionList`, `AuctionDetail`, `Sidebar`, and `AuctionDetailPage` all consume the same live auction data.

### Step 10: Add routing if the app grows
- Right now the app switches views with `viewMode`.
- If the project expands, move to React Router for cleaner navigation.
- Keep the current approach if the app remains small.

## 5) Recommended Data Flow

A clean flow for this app is:

1. `main.jsx` renders `AuthProvider`.
2. `Nav` reads auth state and opens the login modal.
3. `App` fetches auctions, activity, and stats from the backend.
4. `Header`, `Hero`, `AuctionList`, `AuctionDetail`, `Sidebar`, and `AuctionDetailPage` receive the same backend-backed data.
5. A bid or upload action goes to the backend first.
6. MongoDB stores the source data.
7. Cloudinary stores the photos.
8. The frontend refreshes its state from the API after each successful change.

## 6) Suggested Build Order

Do the work in this order:
1. Set up backend server and MongoDB connection.
2. Add auth routes and JWT login.
3. Add auction CRUD routes.
4. Add Cloudinary upload support.
5. Add bidding and activity routes.
6. Replace frontend mock data with API calls.
7. Connect login, bid form, and image upload UI.
8. Add loading, error, and empty states.
9. Test the full flow end to end.

## 7) Acceptance Checklist

The task is complete when:
- Users can log in from the navbar.
- Auctions come from MongoDB instead of local arrays.
- Auction images upload to Cloudinary and render in the UI.
- Bids validate server-side and update current bid data.
- Activity updates after bids.
- All major components stay in sync from one backend source of truth.

## 8) Notes For This Codebase

- Keep `src/components/nav bar/` paths stable unless you intentionally rename the folder.
- The current app uses `viewMode` instead of routing, so don’t add routing unless you need it.
- `App.jsx` is the main place to replace mock data with API calls.
- `AuthProvider` is already the right place to keep login state.

If you want, the next step can be turning this guide into an actual backend folder structure and API skeleton.