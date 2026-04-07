import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Simple schemas for seeding
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'buyer' },
  avatar: String,
  bio: String,
  location: String,
  phone: String,
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const auctionSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  category: String,
  condition: String,
  startingPrice: Number,
  currentBid: Number,
  reserve: Number,
  increment: Number,
  endDate: Date,
  seller: mongoose.Schema.Types.ObjectId,
  bidCount: { type: Number, default: 0 },
  bidderCount: { type: Number, default: 0 },
  accent: String,
  images: Array,
  status: { type: String, default: 'active' },
  location: { type: String, default: 'Virtual' },
  bidders: Array,
  createdAt: { type: Date, default: Date.now }
});

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);
const Auction = mongoose.model('Auction', auctionSchema);

const dummyAuctions = [
  {
    title: 'Vintage Apple Macintosh SE/30',
    subtitle: 'Classic 1989 Computer in Excellent Condition',
    description: 'Original Apple Macintosh SE/30 with working monitor and keyboard. Fully functional, comes with original box. A piece of computing history.',
    category: 'Electronics',
    condition: 'Excellent',
    startingPrice: 150,
    currentBid: 450,
    reserve: 200,
    increment: 25,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    bidCount: 12,
    bidderCount: 8,
    accent: 'blue',
    status: 'active'
  },
  {
    title: 'Eames Lounge Chair Replica',
    subtitle: 'Authentic Mid-Century Modern Design',
    description: 'High-quality replica of the iconic Eames Lounge Chair. Premium leather, comfortable and stylish. Perfect for any modern home.',
    category: 'Furniture',
    condition: 'Mint',
    startingPrice: 300,
    currentBid: 750,
    reserve: 400,
    increment: 50,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    bidCount: 18,
    bidderCount: 14,
    accent: 'green',
    status: 'active'
  },
  {
    title: 'Sony WH-1000XM5 Headphones',
    subtitle: 'Premium Noise-Cancelling Wireless Headphones',
    description: 'Latest model noise-cancelling headphones with exceptional sound quality. Like new condition, original box included.',
    category: 'Audio',
    condition: 'Mint',
    startingPrice: 250,
    currentBid: 320,
    reserve: 280,
    increment: 20,
    endDate: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    bidCount: 8,
    bidderCount: 6,
    accent: 'purple',
    status: 'active'
  },
  {
    title: 'TAG Heuer Aquaracer Dive Watch',
    subtitle: 'Swiss Automatic Luxury Timepiece',
    description: 'Beautiful TAG Heuer Aquaracer with excellent condition. Keeps perfect time, includes warranty card and documentation.',
    category: 'Watches',
    condition: 'Very Good',
    startingPrice: 800,
    currentBid: 1200,
    reserve: 1000,
    increment: 50,
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    bidCount: 15,
    bidderCount: 10,
    accent: 'red',
    status: 'active'
  },
  {
    title: 'Bose QuietComfort 45 Headphones',
    subtitle: 'Professional Noise-Cancelling Audio',
    description: 'Excellent condition Bose headphones with superior comfort. Perfect for travel and work.',
    category: 'Audio',
    condition: 'Excellent',
    startingPrice: 200,
    currentBid: 280,
    reserve: 220,
    increment: 15,
    endDate: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000),
    bidCount: 10,
    bidderCount: 7,
    accent: 'blue',
    status: 'active'
  },
  {
    title: 'Vintage Persian Rug',
    subtitle: 'Handwoven 9x12 Antique Carpet',
    description: 'Beautiful antique Persian rug with rich colors and intricate patterns. Great investment piece.',
    category: 'Antiques',
    condition: 'Good',
    startingPrice: 500,
    currentBid: 900,
    reserve: 700,
    increment: 50,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    bidCount: 14,
    bidderCount: 9,
    accent: 'orange',
    status: 'active'
  },
  {
    title: 'RGB Gaming PC Setup',
    subtitle: 'RTX 4080 Super, Intel i9, 32GB RAM',
    description: 'High-performance gaming PC with latest components. Includes monitor and peripherals. Barely used.',
    category: 'Gaming',
    condition: 'Mint',
    startingPrice: 1000,
    currentBid: 1600,
    reserve: 1300,
    increment: 100,
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    bidCount: 22,
    bidderCount: 15,
    accent: 'purple',
    status: 'active'
  },
  {
    title: 'Original Oil Painting - Landscape',
    subtitle: 'Listed Artist, Canvas 24x36"',
    description: 'Beautiful landscape painting by emerging artist. Signed and dated. Abstract yet realistic style.',
    category: 'Art',
    condition: 'Excellent',
    startingPrice: 400,
    currentBid: 650,
    reserve: 500,
    increment: 30,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    bidCount: 11,
    bidderCount: 8,
    accent: 'green',
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auctionhub');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Auction.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create seller user
    const seller = await User.create({
      name: 'John Seller',
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller',
      bio: 'Professional auction seller',
      location: 'New York, USA'
    });
    console.log('✓ Created seller user');

    // Create buyer user
    const buyer = await User.create({
      name: 'Jane Buyer',
      email: 'buyer@example.com',
      password: 'password123',
      role: 'buyer',
      bio: 'Active bidder',
      location: 'Los Angeles, USA'
    });
    console.log('✓ Created buyer user');

    // Create superadmin user
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'password123',
      role: 'superadmin',
      bio: 'Platform moderation and approvals',
      location: 'HQ'
    });
    console.log('✓ Created superadmin user');

    // Add seller ID to all auctions
    const auctionsWithSeller = dummyAuctions.map(auction => ({
      ...auction,
      seller: seller._id
    }));

    // Insert auctions
    const result = await Auction.insertMany(auctionsWithSeller);
    console.log(`✓ Created ${result.length} auctions`);

    console.log('\n✅ Database seeding completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Seller Email: seller@example.com');
    console.log('Seller Password: password123');
    console.log('Buyer Email: buyer@example.com');
    console.log('Buyer Password: password123');
    console.log('Super Admin Email: superadmin@example.com');
    console.log('Super Admin Password: password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
