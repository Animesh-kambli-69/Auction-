# AuctionHub Backend Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` with your actual values:
   - MongoDB URI (local or Atlas)
   - Cloudinary credentials
   - JWT secret key

5. **Start the server**
   ```bash
   # Development with hot reload
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "avatar": null
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Auction Endpoints

#### Get All Auctions
```http
GET /auctions?category=Gaming&limit=20&offset=0
```

#### Get Single Auction
```http
GET /auctions/auction_id
```

#### Create Auction
```http
POST /auctions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Rare Gaming Item",
  "subtitle": "Mint condition",
  "description": "Complete description...",
  "category": "Gaming",
  "condition": "Mint",
  "startingPrice": 500,
  "reservePrice": 600,
  "increment": 25,
  "endDate": "2024-12-31T23:59:59Z",
  "location": "New York",
  "images": []
}
```

#### Update Auction
```http
PUT /auctions/auction_id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Delete Auction
```http
DELETE /auctions/auction_id
Authorization: Bearer <token>
```

### Bid Endpoints

#### Place Bid
```http
POST /bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "auctionId": "auction_id",
  "bidAmount": 750
}
```

#### Get Bid History
```http
GET /bids/auction/auction_id?limit=20
```

#### Get My Bids
```http
GET /bids/my-bids
Authorization: Bearer <token>
```

#### Validate Bid
```http
POST /bids/validate
Content-Type: application/json

{
  "auctionId": "auction_id",
  "bidAmount": 750
}
```

### Activity Endpoints

#### Get Public Activity
```http
GET /activity?limit=20&offset=0
```

#### Get Auction Activity
```http
GET /activity/auction/auction_id
```

#### Get My Activity
```http
GET /activity/my-activity
Authorization: Bearer <token>
```

## Middleware

### Authentication (`protect`)
Verify JWT token in request headers
```javascript
router.get('/protected', protect, controller);
```

### Authorization (`authorize`)
Check user role
```javascript
router.delete('/admin-only', protect, authorize('admin'), controller);
```

### Validation
Validate request body using express-validator
```javascript
router.post('/create', validationRules, handleValidationErrors, controller);
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Testing

Use Postman, Insomnia, or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123",
    "confirmPassword": "Test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'

# Get Auctions
curl http://localhost:5000/api/auctions
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Atlas, verify IP whitelist includes your IP

### Cloudinary Upload Error
- Verify credentials in .env
- Check Cloudinary dashboard for API settings

### JWT Token Error
- Ensure token is in Authorization header as `Bearer <token>`
- Check that JWT_SECRET in .env matches production config

## Scaling

### For Production
1. Use MongoDB Atlas instead of local MongoDB
2. Use environment-based configuration
3. Enable request rate limiting
4. Add request logging and monitoring
5. Use HTTPS/SSL certificates
6. Implement CORS properly
7. Add database backup strategy
8. Use CDN for image delivery (Cloudinary)

### Performance Tips
1. Add pagination to list endpoints
2. Create database indexes (already included in models)
3. Cache frequently accessed data
4. Use compression middleware
5. Implement request timeout limits

---

See [../FULL_PROJECT_STRUCTURE.md](../FULL_PROJECT_STRUCTURE.md) for complete project overview.
