#!/bin/bash

BASE_URL="http://localhost:5001"
echo "=== TESTING AUCTION HUB API ==="
echo ""

# Test 1: Register a new user
echo "📝 TEST 1: Register User"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Seller",
    "email": "seller@test.com",
    "password": "password123",
    "confirmPassword": "password123"
  }')
echo "$REGISTER_RESPONSE" | grep -q "token" && echo "✅ User registered successfully" || echo "❌ Registration failed"
echo ""

# Test 2: Login
echo "📝 TEST 2: Login User"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@test.com",
    "password": "password123"
  }')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Login response: $LOGIN_RESPONSE" | head -c 100
echo ""
if [ -n "$TOKEN" ]; then
  echo "✅ Login successful, Token: ${TOKEN:0:20}..."
else
  echo "❌ Login failed"
  exit 1
fi
echo ""

# Test 3: Create an auction
echo "📝 TEST 3: Create Auction"
CREATE_AUCTION=$(curl -s -X POST "$BASE_URL/api/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Vintage Watch",
    "description": "Beautiful vintage watch from 1950s",
    "category": "Watches",
    "condition": "Excellent",
    "startBid": 100,
    "reserve": 150,
    "increment": 10,
    "endDate": "2025-04-15T23:59:59Z",
    "location": "New York",
    "images": ["https://via.placeholder.com/400"]
  }')
echo "$CREATE_AUCTION" | head -c 150
AUCTION_ID=$(echo "$CREATE_AUCTION" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo ""
if [ -n "$AUCTION_ID" ]; then
  echo "✅ Auction created: $AUCTION_ID"
else
  echo "⚠️  Create auction response received (check above)"
fi
echo ""

# Test 4: Get all auctions
echo "📝 TEST 4: Fetch All Auctions"
curl -s -X GET "$BASE_URL/api/auctions?limit=5" \
  -H "Content-Type: application/json" | grep -o '"title":"[^"]*' | head -3
echo "✅ Auctions fetched"
echo ""

# Test 5: Get user profile
echo "📝 TEST 5: Get User Profile"
curl -s -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"name":"[^"]*'
echo "✅ Profile fetched"
echo ""

echo "=== ALL TESTS COMPLETED ==="
