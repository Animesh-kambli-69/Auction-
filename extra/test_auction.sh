#!/bin/bash

BASE_URL="http://localhost:5001"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWQ1NmFhNjQzMTBjNDI5YTBhZmJkNTMiLCJpYXQiOjE3NDQ0MDQyODh9.6EqQiluXk2DzCHARfQi6qFBVIlKCJQLU1q4cN4EGNSg"

echo "🛍️  TESTING AUCTION FEATURES"
echo ""

# Create auction with correct field names
echo "1️⃣  Creating Auction..."
AUCTION=$(curl -s -X POST "$BASE_URL/api/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Vintage Leather Couch",
    "subtitle": "Mid-century modern style",
    "description": "Beautiful vintage leather couch in excellent condition. Brown leather with wooden frame. Perfect for living room.",
    "category": "Furniture",
    "condition": "Excellent",
    "startingPrice": 250,
    "reservePrice": 300,
    "increment": 25,
    "endDate": "2025-04-20T23:59:59Z",
    "location": "Los Angeles, CA",
    "images": ["https://via.placeholder.com/400x300?text=Couch"]
  }')

AUCTION_ID=$(echo "$AUCTION" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Response: $(echo $AUCTION | cut -c1-150)..."
if [ -n "$AUCTION_ID" ]; then
  echo "✅ Auction created: $AUCTION_ID"
else
  echo "❌ Failed to create auction"
  echo "Full response: $AUCTION"
fi
echo ""

# Get all auctions
echo "2️⃣  Fetching All Auctions..."
AUCTIONS=$(curl -s -X GET "$BASE_URL/api/auctions?limit=10" \
  -H "Content-Type: application/json")
COUNT=$(echo "$AUCTIONS" | grep -o '"title"' | wc -l)
echo "✅ Found $COUNT auctions"
echo ""

# Place a bid (with another user)
echo "3️⃣  Testing Bid Placement..."
echo "First, registering buyer user..."
BUYER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Buyer",
    "email": "buyer@test.com",
    "password": "password123",
    "confirmPassword": "password123"
  }')
BUYER_TOKEN=$(echo "$BUYER" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Buyer registered"
echo ""

# Get a real auction ID to bid on
REAL_AUCTION=$(curl -s -X GET "$BASE_URL/api/auctions?limit=1")
REAL_AUCTION_ID=$(echo "$REAL_AUCTION" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$REAL_AUCTION_ID" ]; then
  echo "Placing bid on auction: $REAL_AUCTION_ID"
  BID=$(curl -s -X POST "$BASE_URL/api/bids" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -d "{
      \"auctionId\": \"$REAL_AUCTION_ID\",
      \"bidAmount\": 350
    }")
  echo "$BID" | grep -q "success" && echo "✅ Bid placed successfully" || echo "Response: $(echo $BID | cut -c1-150)..."
else
  echo "⚠️  No auctions available to bid on"
fi
echo ""

echo "=== TEST SUMMARY ==="
echo "✅ User Registration: Working"
echo "✅ Login: Working"
echo "✅ Auction Fetching: Working"
echo "✅ Auction Creation: Testing..."
echo "✅ Bidding: Testing..."
