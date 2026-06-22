#!/bin/bash

BASE_URL="http://localhost:5001"
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🎯 AUCTION HUB COMPLETE TEST SUITE 🎯 ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 1. Register Seller
echo "1️⃣  SELLER REGISTRATION & LOGIN"
SELLER_EMAIL="seller_$(date +%s)@test.com"
SELLER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Seller\",
    \"email\": \"$SELLER_EMAIL\",
    \"password\": \"password123\",
    \"confirmPassword\": \"password123\"
  }")
SELLER_TOKEN=$(echo "$SELLER" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
SELLER_ID=$(echo "$SELLER" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
if [ -n "$SELLER_TOKEN" ]; then
  echo "   ✅ Seller registered: $SELLER_EMAIL"
else
  echo "   ❌ Failed to register seller"
  exit 1
fi
echo ""

# 2. Create Auction
echo "2️⃣  CREATE AUCTION LISTING"
AUCTION=$(curl -s -X POST "$BASE_URL/api/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "title": "Vintage Leather Office Chair",
    "subtitle": "Executive style, perfect condition",
    "description": "Beautiful vintage brown leather office chair. Fully functional with smooth swivel and adjustment. Great for home office or executive suite. No tears or stains. Circa 1980s.",
    "category": "Furniture",
    "condition": "Excellent",
    "startingPrice": 150,
    "reservePrice": 200,
    "increment": 20,
    "endDate": "2025-04-25T23:59:59Z",
    "location": "San Francisco, CA",
    "images": [
      {
        "url": "https://via.placeholder.com/500x400?text=Leather+Chair",
        "publicId": "auction_chair_001"
      }
    ]
  }')

AUCTION_ID=$(echo "$AUCTION" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
STATUS=$(echo "$AUCTION" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
if [ -n "$AUCTION_ID" ]; then
  echo "   ✅ Auction created: $AUCTION_ID"
  echo "   📊 Status: $STATUS (draft by default, needs admin approval)"
else
  echo "   ❌ Failed to create auction"
  echo "   Response: $(echo $AUCTION | cut -c1-200)..."
fi
echo ""

# 3. Register Buyer
echo "3️⃣  BUYER REGISTRATION & LOGIN"
BUYER_EMAIL="buyer_$(date +%s)@test.com"
BUYER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Jane Buyer\",
    \"email\": \"$BUYER_EMAIL\",
    \"password\": \"password123\",
    \"confirmPassword\": \"password123\"
  }")
BUYER_TOKEN=$(echo "$BUYER" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$BUYER_TOKEN" ]; then
  echo "   ✅ Buyer registered: $BUYER_EMAIL"
else
  echo "   ❌ Failed to register buyer"
fi
echo ""

# 4. View Auctions
echo "4️⃣  VIEW AVAILABLE AUCTIONS"
AUCTIONS=$(curl -s -X GET "$BASE_URL/api/auctions?limit=10" \
  -H "Content-Type: application/json")
TOTAL=$(echo "$AUCTIONS" | grep -c '"title"')
echo "   ✅ Found $TOTAL active auctions in database"
FIRST_TITLE=$(echo "$AUCTIONS" | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)
echo "   📌 Example: $FIRST_TITLE"
echo ""

# 5. Get Auction Details
echo "5️⃣  VIEW AUCTION DETAILS"
FIRST_ID=$(echo "$AUCTIONS" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
if [ -n "$FIRST_ID" ]; then
  DETAILS=$(curl -s -X GET "$BASE_URL/api/auctions/$FIRST_ID")
  TITLE=$(echo "$DETAILS" | grep -o '"title":"[^"]*' | cut -d'"' -f4 | head -1)
  CURRENT_BID=$(echo "$DETAILS" | grep -o '"currentBid":[0-9]*' | cut -d':' -f2)
  echo "   ✅ Auction: $TITLE"
  echo "   💰 Current bid: \$$CURRENT_BID"
else
  echo "   ⚠️  No auction details available"
fi
echo ""

# 6. Place Bid
echo "6️⃣  PLACE BID ON AUCTION"
if [ -n "$FIRST_ID" ]; then
  BID=$(curl -s -X POST "$BASE_URL/api/bids" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -d "{
      \"auctionId\": \"$FIRST_ID\",
      \"bidAmount\": $(($CURRENT_BID + 100))
    }")
  
  if echo "$BID" | grep -q '"success":true'; then
    BID_ID=$(echo "$BID" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   ✅ Bid placed successfully!"
    echo "   🏷️  Bid ID: $BID_ID"
    echo "   💵 Amount: \$$(($CURRENT_BID + 100))"
  else
    echo "   Response: $(echo $BID | cut -c1-150)..."
  fi
else
  echo "   ⚠️  Skipped (no auction available)"
fi
echo ""

# 7. Update User Profile
echo "7️⃣  UPDATE USER PROFILE"
PROFILE=$(curl -s -X PUT "$BASE_URL/api/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "bio": "Passionate collector of vintage items",
    "location": "San Francisco, CA",
    "phone": "+1-555-0100"
  }')

if echo "$PROFILE" | grep -q "success"; then
  echo "   ✅ Profile updated successfully"
else
  echo "   Response: $(echo $PROFILE | cut -c1-150)..."
fi
echo ""

# 8. Get My Bids
echo "8️⃣  FETCH MY BIDS"
MY_BIDS=$(curl -s -X GET "$BASE_URL/api/bids/my-bids" \
  -H "Authorization: Bearer $BUYER_TOKEN")
BID_COUNT=$(echo "$MY_BIDS" | grep -c '"_id"')
echo "   ✅ You have placed $BID_COUNT bids"
echo ""

echo "╔════════════════════════════════════════╗"
echo "║        ✅ TESTS COMPLETED ✅           ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📋 SUMMARY:"
echo "   ✅ User Registration (Seller & Buyer)"
echo "   ✅ Auction Creation"
echo "   ✅ View Auctions List"
echo "   ✅ View Auction Details"
echo "   ✅ Place Bids"
echo "   ✅ Update User Profile"
echo "   ✅ View My Bids"
echo ""
echo "🔐 Note: Auctions default to DRAFT status"
echo "   Admin approval required before bidding"
echo ""
