

const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
  title: String,
  shortDescription: String,
  fullDescription: String,
  price: Number,
  discountPrice: Number,
  category: String,
  sizes: [String],
  colors: [{ name: String, hexCode: String }],
  images: [String],
  stock: Number,
  featured: Boolean,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    title: "Premium Winter Wool Jacket",
    shortDescription: "Luxurious wool blend jacket for Bangladesh's winter",
    fullDescription: "Our Premium Winter Wool Jacket combines timeless elegance with modern comfort. Perfect for Dhaka's winter season.",
    price: 4500,
    discountPrice: 3999,
    category: "Jacket",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal Black", hexCode: "#2C2C2C" },
      { name: "Navy Blue", hexCode: "#1B2845" }
    ],
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80"
    ],
    stock: 25,
    featured: true
  },
  {
    title: "Classic Formal Full Shirt",
    shortDescription: "Premium cotton formal shirt with wrinkle-free fabric",
    fullDescription: "Elevate your professional wardrobe with our Classic Formal Full Shirt. Made from 100% premium cotton.",
    price: 1800,
    discountPrice: 1599,
    category: "Full Shirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Pure White", hexCode: "#FFFFFF" },
      { name: "Sky Blue", hexCode: "#87CEEB" }
    ],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"
    ],
    stock: 50,
    featured: true
  },
  {
    title: "Merino Wool Sweater",
    shortDescription: "Soft merino wool sweater with ribbed texture",
    fullDescription: "Experience luxury comfort with our Merino Wool Sweater. Lightweight yet warm.",
    price: 2800,
    discountPrice: 2499,
    category: "Sweater",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Oatmeal Beige", hexCode: "#D4AF7A" },
      { name: "Forest Green", hexCode: "#228B22" }
    ],
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"
    ],
    stock: 30,
    featured: true
  },
  {
    title: "Premium Cotton Trousers",
    shortDescription: "Tailored cotton trousers with perfect fit",
    fullDescription: "Our Premium Cotton Trousers are meticulously crafted for the modern professional.",
    price: 2200,
    discountPrice: 1999,
    category: "Trouser",
    sizes: ["30", "32", "34", "36", "38"],
    colors: [
      { name: "Charcoal Grey", hexCode: "#36454F" },
      { name: "Navy Blue", hexCode: "#000080" }
    ],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"
    ],
    stock: 40,
    featured: true
  },
  {
    title: "Tailored Blazer",
    shortDescription: "Sharp tailored blazer in premium fabric",
    fullDescription: "Complete your formal wardrobe with our Tailored Blazer.",
    price: 5500,
    discountPrice: 4999,
    category: "Blazer",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Midnight Black", hexCode: "#000000" },
      { name: "Navy Blue", hexCode: "#001F3F" }
    ],
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"
    ],
    stock: 20,
    featured: true
  },
  {
    title: "Long Overcoat",
    shortDescription: "Elegant long overcoat for winter",
    fullDescription: "Our Long Overcoat is the ultimate winter statement piece.",
    price: 7500,
    discountPrice: 6999,
    category: "Coat",
    sizes: ["L", "XL", "XXL"],
    colors: [
      { name: "Classic Black", hexCode: "#000000" },
      { name: "Camel", hexCode: "#C19A6B" }
    ],
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80"
    ],
    stock: 12,
    featured: false
  },
  {
    title: "Premium Leather Belt",
    shortDescription: "Genuine leather belt with classic buckle",
    fullDescription: "Complete your outfit with our Premium Leather Belt.",
    price: 1200,
    discountPrice: 999,
    category: "Accessories",
    sizes: ["32", "34", "36", "38"],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "Brown", hexCode: "#654321" }
    ],
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=800&q=80"
    ],
    stock: 60,
    featured: false
  },
  {
    title: "Slim Fit Casual Shirt",
    shortDescription: "Modern slim fit casual shirt in breathable cotton",
    fullDescription: "Update your casual wardrobe with our Slim Fit Casual Shirt.",
    price: 1500,
    discountPrice: 0,
    category: "Full Shirt",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Oxford Blue", hexCode: "#002147" },
      { name: "Mint Green", hexCode: "#98FF98" }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
    ],
    stock: 45,
    featured: true
  }
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    console.log('➕ Adding new products...');
    await Product.insertMany(sampleProducts);

    console.log(`✅ Successfully added ${sampleProducts.length} products!`);
    console.log('🎉 Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();