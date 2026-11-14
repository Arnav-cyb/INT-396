const fs = require('fs');
const path = require('path');

const CATEGORY_DEFINITIONS = [
  {
    category: "Electronics",
    products: [
      { id: "ELE-01", name: "Wireless Noise-Canceling Headphones", basePrice: 199.99 },
      { id: "ELE-02", name: "4K Ultra HD Smart TV 55-inch", basePrice: 479.0 },
      { id: "ELE-03", name: "Bluetooth Portable Speaker", basePrice: 69.5 },
      { id: "ELE-04", name: "Fast USB-C Charging Hub", basePrice: 34.99 },
      { id: "ELE-05", name: "Smart Fitness Watch", basePrice: 149.95 },
    ],
  },
  {
    category: "Computers & Gaming",
    products: [
      { id: "CMP-01", name: "Mechanical Gaming Keyboard RGB", basePrice: 119.0 },
      { id: "CMP-02", name: "Wireless Ergonomic Mouse", basePrice: 59.99 },
      { id: "CMP-03", name: "27-inch 165Hz Gaming Monitor", basePrice: 289.99 },
      { id: "CMP-04", name: "Pro Gaming Headset with Mic", basePrice: 89.95 },
      { id: "CMP-05", name: "High-Speed NVMe 1TB SSD", basePrice: 94.5 },
    ],
  },
  {
    category: "Organic Grocery",
    products: [
      { id: "GRO-01", name: "Organic Cold-Pressed Olive Oil", basePrice: 18.5 },
      { id: "GRO-02", name: "Artisanal Sourdough Bread", basePrice: 6.25 },
      { id: "GRO-03", name: "Organic Fair-Trade Coffee Beans", basePrice: 14.99 },
      { id: "GRO-04", name: "Grass-Fed Greek Yogurt 32oz", basePrice: 5.75 },
      { id: "GRO-05", name: "Raw Honey & Chia Superfood Pack", basePrice: 12.5 },
    ],
  },
  {
    category: "Health & Beauty",
    products: [
      { id: "HLT-01", name: "Botanical Hydrating Facial Serum", basePrice: 42.0 },
      { id: "HLT-02", name: "Mineral Sunscreen SPF 50", basePrice: 24.5 },
      { id: "HLT-03", name: "Multivitamin Daily Pack 90ct", basePrice: 29.99 },
      { id: "HLT-04", name: "Herbal Lavender Bath Soak", basePrice: 16.5 },
      { id: "HLT-05", name: "Vegan Protein Powder Vanilla", basePrice: 38.0 },
    ],
  },
  {
    category: "Home & Kitchen",
    products: [
      { id: "HMK-01", name: "Cast Iron Dutch Oven 6qt", basePrice: 89.99 },
      { id: "HMK-02", name: "Stainless Steel Chef Knife Set", basePrice: 129.5 },
      { id: "HMK-03", name: "Ceramic Non-Stick Skillet 10in", basePrice: 45.0 },
      { id: "HMK-04", name: "Electric Gooseneck Pour-Over Kettle", basePrice: 55.0 },
      { id: "HMK-05", name: "Bamboo Cutting Board 3-Pack", basePrice: 28.0 },
    ],
  },
  {
    category: "Home Decor",
    products: [
      { id: "DEC-01", name: "Handmade Ceramic Vase Duo", basePrice: 36.0 },
      { id: "DEC-02", name: "Boho Textured Throw Blanket", basePrice: 48.5 },
      { id: "DEC-03", name: "Dimmable Ambient Table Lamp", basePrice: 64.0 },
      { id: "DEC-04", name: "Scented Soy Candle Cedar & Sage", basePrice: 22.0 },
      { id: "DEC-05", name: "Framed Botanical Canvas Art", basePrice: 75.0 },
    ],
  },
  {
    category: "Apparel & Fashion",
    products: [
      { id: "APP-01", name: "Classic Slim-Fit Denim Jeans", basePrice: 78.0 },
      { id: "APP-02", name: "Organic Cotton Crewneck Tee", basePrice: 26.5 },
      { id: "APP-03", name: "Water-Resistant Trench Coat", basePrice: 165.0 },
      { id: "APP-04", name: "Merino Wool Knit Sweater", basePrice: 95.0 },
      { id: "APP-05", name: "Athletic Performance Joggers", basePrice: 54.0 },
    ],
  },
  {
    category: "Footwear & Accessories",
    products: [
      { id: "ACC-01", name: "Italian Leather Minimalist Wallet", basePrice: 49.0 },
      { id: "ACC-02", name: "Classic White Leather Sneakers", basePrice: 110.0 },
      { id: "ACC-03", name: "Polarized UV Protection Sunglasses", basePrice: 65.0 },
      { id: "ACC-04", name: "Canvas Travel Duffle Bag", basePrice: 85.0 },
      { id: "ACC-05", name: "Genuine Leather Dress Belt", basePrice: 38.0 },
    ],
  },
];

const totalCustomers = 280;
const customerProfiles = Array.from({ length: totalCustomers }, (_, i) => {
  const custId = `CUST-${String(1001 + i)}`;
  const segmentChoice = i % 4;

  let ageGroup = "25-34";
  let region = "North America";
  let primaryCats = [];

  if (segmentChoice === 0) {
    ageGroup = i % 2 === 0 ? "18-24" : "25-34";
    region = i % 3 === 0 ? "West Coast" : "East Coast";
    primaryCats = ["Electronics", "Computers & Gaming"];
  } else if (segmentChoice === 1) {
    ageGroup = i % 2 === 0 ? "35-44" : "45-54";
    region = i % 3 === 0 ? "Midwest" : "Pacific NW";
    primaryCats = ["Organic Grocery", "Health & Beauty"];
  } else if (segmentChoice === 2) {
    ageGroup = i % 2 === 0 ? "35-44" : "55+";
    region = i % 3 === 0 ? "South" : "Mountain West";
    primaryCats = ["Home & Kitchen", "Home Decor"];
  } else {
    ageGroup = i % 2 === 0 ? "25-34" : "18-24";
    region = i % 3 === 0 ? "Northeast" : "Metro South";
    primaryCats = ["Apparel & Fashion", "Footwear & Accessories"];
  }

  return { custId, segmentChoice, ageGroup, region, primaryCats };
});

const rows = [];
let txCounter = 5001;
const startDate = new Date("2024-01-10").getTime();
const endDate = new Date("2024-11-01").getTime();

while (rows.length < 1850) {
  const cust = customerProfiles[Math.floor(Math.random() * customerProfiles.length)];
  const txId = `TX-${txCounter++}`;
  const txTimestamp = new Date(startDate + Math.random() * (endDate - startDate));
  const txDate = txTimestamp.toISOString().split("T")[0];

  const basketSize = Math.floor(Math.random() * 3) + 1;
  const basketCategories = new Set();

  for (let b = 0; b < basketSize; b++) {
    if (Math.random() < 0.8) {
      const cat = cust.primaryCats[Math.floor(Math.random() * cust.primaryCats.length)];
      basketCategories.add(cat);
    } else {
      const randomCatDef = CATEGORY_DEFINITIONS[Math.floor(Math.random() * CATEGORY_DEFINITIONS.length)];
      basketCategories.add(randomCatDef.category);
    }
  }

  for (const catName of Array.from(basketCategories)) {
    const catDef = CATEGORY_DEFINITIONS.find((c) => c.category === catName);
    const product = catDef.products[Math.floor(Math.random() * catDef.products.length)];
    const qty = Math.random() < 0.8 ? 1 : Math.floor(Math.random() * 2) + 2;
    const priceJitter = Math.round((Math.random() * 0.1 - 0.05) * product.basePrice * 100) / 100;
    const unitPrice = Math.max(1.99, Math.round((product.basePrice + priceJitter) * 100) / 100);

    rows.push([
      `"${txId}"`,
      `"${cust.custId}"`,
      `"${product.id}"`,
      `"${product.name.replace(/"/g, '""')}"`,
      `"${catDef.category}"`,
      qty,
      unitPrice,
      `"${txDate}"`,
      `"${cust.ageGroup}"`,
      `"${cust.region}"`,
    ].join(","));

    if (rows.length >= 1850) break;
  }
}

const header = "transaction_id,customer_id,product_id,product_name,product_category,quantity,unit_price,transaction_date,customer_age_group,region";
const csvContent = [header, ...rows].join("\n");

if (!fs.existsSync(path.join(__dirname, '../public'))) {
  fs.mkdirSync(path.join(__dirname, '../public'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, '../datasets'))) {
  fs.mkdirSync(path.join(__dirname, '../datasets'), { recursive: true });
}

fs.writeFileSync(path.join(__dirname, '../public/retail_transactions_synthetic.csv'), csvContent);
fs.writeFileSync(path.join(__dirname, '../datasets/retail_transactions_synthetic.csv'), csvContent);
console.log(`Generated ${rows.length} rows successfully!`);
