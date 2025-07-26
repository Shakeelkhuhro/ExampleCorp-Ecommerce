require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const sampleProducts = [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals.',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Electronics',
    brand: 'AudioTech',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 50,
    rating: 4.5,
    reviews: 156,
    featured: true,
    tags: ['wireless', 'noise-cancelling', 'premium'],
    specifications: {
      'Battery Life': '30 hours',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '250g',
      'Warranty': '2 years'
    }
  },
  {
    name: 'Ergonomic Wireless Mouse',
    description: 'Comfortable wireless mouse designed for productivity and gaming. Features precision tracking and long battery life.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'Electronics',
    brand: 'TechPro',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 100,
    rating: 4.8,
    reviews: 89,
    featured: true,
    tags: ['wireless', 'ergonomic', 'gaming'],
    specifications: {
      'DPI': '3200',
      'Battery': 'Rechargeable',
      'Compatibility': 'Windows, Mac, Linux'
    }
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'Professional mechanical keyboard with RGB backlighting and tactile switches. Built for gaming and typing enthusiasts.',
    price: 129.99,
    category: 'Electronics',
    brand: 'GameMaster',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 75,
    rating: 4.7,
    reviews: 234,
    featured: true,
    tags: ['mechanical', 'gaming', 'rgb'],
    specifications: {
      'Switch Type': 'Cherry MX Blue',
      'Backlighting': 'RGB',
      'Layout': 'Full Size',
      'Connection': 'USB-C'
    }
  },
  {
    name: 'Adjustable Smartphone Stand',
    description: 'Universal smartphone stand with adjustable angles. Perfect for video calls, watching content, and desk organization.',
    price: 24.99,
    category: 'Accessories',
    brand: 'StandPro',
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 200,
    rating: 4.3,
    reviews: 67,
    tags: ['stand', 'adjustable', 'universal'],
    specifications: {
      'Material': 'Aluminum Alloy',
      'Compatibility': 'All smartphones',
      'Angles': '0-270 degrees'
    }
  },
  {
    name: 'USB-C Fast Charging Cable',
    description: 'High-speed USB-C charging cable with reinforced connectors. Supports fast charging and data transfer.',
    price: 19.99,
    category: 'Accessories',
    brand: 'ChargeFast',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 300,
    rating: 4.6,
    reviews: 123,
    tags: ['usb-c', 'fast-charging', 'durable'],
    specifications: {
      'Length': '6 feet',
      'Power': '100W',
      'Data Speed': 'USB 3.1',
      'Material': 'Braided Nylon'
    }
  },
  {
    name: 'Portable Power Bank',
    description: 'High-capacity portable charger with multiple ports. Keep your devices powered on the go.',
    price: 39.99,
    originalPrice: 59.99,
    category: 'Electronics',
    brand: 'PowerPlus',
    image: 'https://images.unsplash.com/photo-1609592806320-3d93bd499ac7?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 120,
    rating: 4.4,
    reviews: 89,
    featured: true,
    tags: ['portable', 'power-bank', 'fast-charging'],
    specifications: {
      'Capacity': '20000mAh',
      'Ports': '2x USB-A, 1x USB-C',
      'Fast Charge': 'Yes',
      'Weight': '450g'
    }
  },
  {
    name: 'Bluetooth Portable Speaker',
    description: 'Compact Bluetooth speaker with powerful sound and waterproof design. Perfect for outdoor activities.',
    price: 79.99,
    category: 'Electronics',
    brand: 'SoundWave',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 80,
    rating: 4.5,
    reviews: 156,
    featured: true,
    tags: ['bluetooth', 'waterproof', 'portable'],
    specifications: {
      'Battery Life': '12 hours',
      'Waterproof': 'IPX7',
      'Range': '30 feet',
      'Drivers': '2x 10W'
    }
  },
  {
    name: 'Premium Phone Case',
    description: 'Durable phone case with shock absorption and wireless charging compatibility. Stylish protection for your device.',
    price: 14.99,
    originalPrice: 24.99,
    category: 'Accessories',
    brand: 'ProtectPlus',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=200&fit=crop&crop=center',
    inStock: true,
    quantity: 250,
    rating: 4.2,
    reviews: 78,
    tags: ['protection', 'wireless-charging', 'stylish'],
    specifications: {
      'Material': 'TPU + PC',
      'Drop Protection': '6 feet',
      'Wireless Charging': 'Compatible',
      'Colors': 'Multiple'
    }
  }
];

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@examplecorp.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // Create users
    const users = await User.create(sampleUsers);
    console.log(`👥 Created ${users.length} users`);
    
    // Create products
    const products = await Product.create(sampleProducts);
    console.log(`📦 Created ${products.length} products`);
    
    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Admin credentials:');
    console.log('Email: admin@examplecorp.com');
    console.log('Password: admin123');
    console.log('\n📋 Test user credentials:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
