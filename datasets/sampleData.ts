import { RawTransaction } from "../lib/types";

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  iconName: string;
  categories: string[];
  customerCount: number;
  targetRows: number;
}

export const DATASET_PRESETS: DatasetPreset[] = [
  {
    id: "omnichannel",
    name: "Omnichannel Enterprise Retail",
    description: "Diverse catalog spanning Electronics, Groceries, Apparel, Home & Decor with 4 distinct lifestyle segments.",
    iconName: "Store",
    categories: [
      "Electronics",
      "Computers & Gaming",
      "Organic Grocery",
      "Health & Beauty",
      "Home & Kitchen",
      "Home Decor",
      "Apparel & Fashion",
      "Footwear & Accessories",
    ],
    customerCount: 300,
    targetRows: 1850,
  },
  {
    id: "electronics_gaming",
    name: "Tech & Gaming Ecosystem",
    description: "High-spec tech retailer with PC builders, casual console gamers, smart home adopters, and audio enthusiasts.",
    iconName: "Cpu",
    categories: [
      "PC Hardware & GPUs",
      "Gaming Peripherals",
      "Ultra-HD Displays",
      "Smart Home Automation",
      "High-Fidelity Audio",
      "VR & Simulation",
      "Cables & Power Hubs",
    ],
    customerCount: 260,
    targetRows: 2100,
  },
  {
    id: "supermarket_cpg",
    name: "CPG Supermarket & Grocery",
    description: "High-frequency grocery baskets analyzing organic wellness families, budget multi-buyers, and gourmet shoppers.",
    iconName: "ShoppingBag",
    categories: [
      "Organic Fresh Produce",
      "Artisan Bakery & Deli",
      "Grass-Fed Dairy & Eggs",
      "Specialty Coffee & Teas",
      "Gourmet Snacks & Sweets",
      "Craft Beverages & Wine",
      "Eco-Friendly Household",
    ],
    customerCount: 320,
    targetRows: 2400,
  },
  {
    id: "luxury_fashion",
    name: "Luxury Apparel & Fashion House",
    description: "Premium lifestyle fashion boutique segmenting VIP high-rollers, seasonal trendsetters, and accessory collectors.",
    iconName: "Gem",
    categories: [
      "Designer Outerwear",
      "Runway Dresses & Suits",
      "Handcrafted Footwear",
      "Luxury Leather Bags",
      "Fine Jewelry & Watches",
      "Haute Fragrances",
    ],
    customerCount: 220,
    targetRows: 1500,
  },
];

// Product pools per catalog preset
const PRESET_PRODUCTS: Record<string, Record<string, { id: string; name: string; basePrice: number }[]>> = {
  omnichannel: {
    Electronics: [
      { id: "ELE-01", name: "Noise-Canceling Over-Ear Headphones", basePrice: 229.0 },
      { id: "ELE-02", name: "4K OLED Smart Entertainment Display 55\"", basePrice: 589.0 },
      { id: "ELE-03", name: "Portable Bluetooth Waterproof Speaker", basePrice: 79.99 },
      { id: "ELE-04", name: "Multi-Port GaN 100W Charging Station", basePrice: 45.0 },
      { id: "ELE-05", name: "Biometric Smart Fitness Smartwatch", basePrice: 179.0 },
    ],
    "Computers & Gaming": [
      { id: "CMP-01", name: "Mechanical RGB Gaming Keyboard (Linear Switches)", basePrice: 129.0 },
      { id: "CMP-02", name: "Ultralight Wireless Esports Gaming Mouse", basePrice: 69.99 },
      { id: "CMP-03", name: "27-inch 165Hz QHD Gaming Monitor", basePrice: 319.0 },
      { id: "CMP-04", name: "Pro Gaming Headset with Broadcast Mic", basePrice: 99.0 },
      { id: "CMP-05", name: "NVMe PCIe 4.0 2TB High-Speed SSD", basePrice: 139.0 },
    ],
    "Organic Grocery": [
      { id: "GRO-01", name: "Single-Estate Cold-Pressed Olive Oil 1L", basePrice: 21.5 },
      { id: "GRO-02", name: "Artisanal Sourdough Boule & Cultured Butter", basePrice: 7.5 },
      { id: "GRO-03", name: "Fair-Trade Organic Whole Bean Coffee 1kg", basePrice: 18.0 },
      { id: "GRO-04", name: "Organic Greek Yogurt & Superberry Blend", basePrice: 6.99 },
      { id: "GRO-05", name: "Raw Mountain Blossom Honey 500g", basePrice: 14.5 },
    ],
    "Health & Beauty": [
      { id: "HLT-01", name: "Hyaluronic & Peptide Face Serum 50ml", basePrice: 48.0 },
      { id: "HLT-02", name: "Broad Spectrum Mineral Sunscreen SPF 50", basePrice: 28.0 },
      { id: "HLT-03", name: "Clinical Strength Omega-3 & Vitamin D Pack", basePrice: 34.0 },
      { id: "HLT-04", name: "Lavender & Magnesium Detox Bath Flakes", basePrice: 19.5 },
      { id: "HLT-05", name: "Organic Plant-Based Protein Powder 1kg", basePrice: 42.0 },
    ],
    "Home & Kitchen": [
      { id: "HMK-01", name: "Enameled Cast Iron Dutch Oven 6.5qt", basePrice: 119.0 },
      { id: "HMK-02", name: "Japanese High-Carbon Steel Chef Knife", basePrice: 145.0 },
      { id: "HMK-03", name: "Tri-Ply Stainless Clad Sauté Pan 11\"", basePrice: 65.0 },
      { id: "HMK-04", name: "Variable Temp Gooseneck Drip Kettle", basePrice: 72.0 },
      { id: "HMK-05", name: "Organic Bamboo End-Grain Carving Board", basePrice: 36.0 },
    ],
    "Home Decor": [
      { id: "DEC-01", name: "Hand-Thrown Speckled Ceramic Vase Set", basePrice: 45.0 },
      { id: "DEC-02", name: "Chunky Knit Merino Wool Throw Blanket", basePrice: 68.0 },
      { id: "DEC-03", name: "Sculptural Brass Ambient Table Lamp", basePrice: 89.0 },
      { id: "DEC-04", name: "Wild Moss & Smoked Birch Botanical Candle", basePrice: 26.0 },
      { id: "DEC-05", name: "Archival Minimalist Architectural Art Print", basePrice: 85.0 },
    ],
    "Apparel & Fashion": [
      { id: "APP-01", name: "Selvedge Raw Denim Slim-Straight Jeans", basePrice: 98.0 },
      { id: "APP-02", name: "Heavyweight Organic Supima Cotton Tee", basePrice: 32.0 },
      { id: "APP-03", name: "Weather-Shield Tailored Trench Coat", basePrice: 195.0 },
      { id: "APP-04", name: "Ultra-Fine Merino Crewneck Sweater", basePrice: 115.0 },
      { id: "APP-05", name: "Technical Commuter Water-Repellent Pants", basePrice: 78.0 },
    ],
    "Footwear & Accessories": [
      { id: "ACC-01", name: "Full-Grain Italian Bifold Leather Wallet", basePrice: 58.0 },
      { id: "ACC-02", name: "Minimalist Low-Top Nappa Leather Sneakers", basePrice: 135.0 },
      { id: "ACC-03", name: "Handmade Acetate Polarized Sunglasses", basePrice: 88.0 },
      { id: "ACC-04", name: "Waxed Rugged Canvas Weekend Duffle", basePrice: 110.0 },
      { id: "ACC-05", name: "Solid Brass Buckle Bridle Leather Belt", basePrice: 46.0 },
    ],
  },
  electronics_gaming: {
    "PC Hardware & GPUs": [
      { id: "GPU-01", name: "GeForce RTX 4080 Super 16GB OC Edition", basePrice: 999.0 },
      { id: "CPU-01", name: "Core i9-14900K 24-Core Unlocked Desktop Processor", basePrice: 549.0 },
      { id: "MBD-01", name: "Z790 Dark Hero PCIe 5.0 Motherboard", basePrice: 389.0 },
      { id: "RAM-01", name: "DDR5 6000MHz 64GB Low-Latency Kit", basePrice: 219.0 },
    ],
    "Gaming Peripherals": [
      { id: "PER-01", name: "Hall-Effect Magnetic Rapid Trigger Keyboard", basePrice: 189.0 },
      { id: "PER-02", name: "8000Hz Hyper-Polling Optical Gaming Mouse", basePrice: 119.0 },
      { id: "PER-03", name: "Glass Composite Precision Speed Mousepad", basePrice: 59.0 },
      { id: "PER-04", name: "Low-Profile Boom Arm Studio Microphone", basePrice: 129.0 },
    ],
    "Ultra-HD Displays": [
      { id: "DSP-01", name: "34\" Curved QD-OLED 175Hz Ultrawide Monitor", basePrice: 799.0 },
      { id: "DSP-02", name: "27\" Fast-IPS 360Hz Esports Competition Display", basePrice: 499.0 },
      { id: "DSP-03", name: "Dual Monitor Heavy-Duty Spring Arm Mount", basePrice: 89.0 },
    ],
    "Smart Home Automation": [
      { id: "SMT-01", name: "Matter & Thread Smart Mesh Gateway Hub", basePrice: 79.0 },
      { id: "SMT-02", name: "Dynamic Smart Gradient Ambient LED Lightstrip 5m", basePrice: 89.0 },
      { id: "SMT-03", name: "Smart Air Quality & VOC Monitor", basePrice: 65.0 },
    ],
    "High-Fidelity Audio": [
      { id: "AUD-01", name: "Open-Back Planar Magnetic Audiophile Headphones", basePrice: 379.0 },
      { id: "AUD-02", name: "Desktop Balanced DAC & Headphone Amplifier", basePrice: 229.0 },
      { id: "AUD-03", name: "Powered Bookshelf Studio Reference Monitors (Pair)", basePrice: 289.0 },
    ],
    "VR & Simulation": [
      { id: "VRS-01", name: "Next-Gen All-in-One PCVR Headset 512GB", basePrice: 499.0 },
      { id: "VRS-02", name: "Direct Drive Racing Wheelbase & Force Pedals", basePrice: 649.0 },
      { id: "VRS-03", name: "Dual-Grip Flight Simulation HOTAS Controller", basePrice: 199.0 },
    ],
    "Cables & Power Hubs": [
      { id: "CAB-01", name: "Certified Ultra High-Speed HDMI 2.1 Braided Cable", basePrice: 29.0 },
      { id: "CAB-02", name: "Thunderbolt 4 100W Docking Station 11-in-1", basePrice: 179.0 },
      { id: "CAB-03", name: "Surge Protected Rackmount PDU Strip", basePrice: 49.0 },
    ],
  },
  supermarket_cpg: {
    "Organic Fresh Produce": [
      { id: "PRD-01", name: "Organic Honeycrisp Apples 3lb Bag", basePrice: 8.5 },
      { id: "PRD-02", name: "Heirloom Vine-Ripened Tomatoes 1lb", basePrice: 5.2 },
      { id: "PRD-03", name: "Baby Tuscan Kale & Wild Arugula Clamshell", basePrice: 4.8 },
      { id: "PRD-04", name: "Organic Hass Avocados 4-Pack", basePrice: 6.5 },
    ],
    "Artisan Bakery & Deli": [
      { id: "BAK-01", name: "Rustic Whole Wheat Levain Boule", basePrice: 6.8 },
      { id: "BAK-02", name: "Prosciutto di Parma 24-Month Aged 6oz", basePrice: 13.5 },
      { id: "BAK-03", name: "French Butter Flaky Croissants 4-Pack", basePrice: 8.2 },
      { id: "BAK-04", name: "Imported Parmigiano Reggiano Wedge 8oz", basePrice: 11.0 },
    ],
    "Grass-Fed Dairy & Eggs": [
      { id: "DRY-01", name: "Pasture-Raised Organic Large Brown Eggs 1 Dozen", basePrice: 7.2 },
      { id: "DRY-02", name: "Whole A2 Grass-Fed Creamline Milk 0.5 Gal", basePrice: 5.9 },
      { id: "DRY-03", name: "European Sea Salt Cultured Butter 250g", basePrice: 6.5 },
      { id: "DRY-04", name: "Triple Cream Artisanal French Brie 7oz", basePrice: 9.8 },
    ],
    "Specialty Coffee & Teas": [
      { id: "COF-01", name: "Ethiopian Yirgacheffe Light Roast Whole Bean", basePrice: 17.5 },
      { id: "COF-02", name: "Japanese Ceremonial Grade Uji Matcha 30g", basePrice: 24.0 },
      { id: "COF-03", name: "Organic Earl Grey Imperial Loose Leaf 100g", basePrice: 12.0 },
    ],
    "Gourmet Snacks & Sweets": [
      { id: "SNK-01", name: "Truffle & Rosemary Roasted Marcona Almonds", basePrice: 9.5 },
      { id: "SNK-02", name: "Single-Origin 72% Dark Chocolate Bar with Sea Salt", basePrice: 5.5 },
      { id: "SNK-03", name: "Artisanal Olive Oil Sea Salt Crackers", basePrice: 6.2 },
    ],
    "Craft Beverages & Wine": [
      { id: "BEV-01", name: "Sparkling Mineral Water Blood Orange 6-Pack", basePrice: 7.9 },
      { id: "BEV-02", name: "Organic Ginger & Turmeric Raw Kombucha 16oz", basePrice: 4.5 },
      { id: "BEV-03", name: "Napa Valley Cabernet Sauvignon 750ml", basePrice: 38.0 },
    ],
    "Eco-Friendly Household": [
      { id: "HSH-01", name: "Plant-Based Biodegradable Laundry Pods 60ct", basePrice: 18.5 },
      { id: "HSH-02", name: "Essential Oil Multi-Surface Spray Duo", basePrice: 11.0 },
      { id: "HSH-03", name: "Unbleached Bamboo Fiber Paper Towels 6-Pack", basePrice: 14.5 },
    ],
  },
  luxury_fashion: {
    "Designer Outerwear": [
      { id: "OUT-01", name: "Double-Breasted Cashmere Blend Trench Coat", basePrice: 890.0 },
      { id: "OUT-02", name: "Shearling Lined Lambskin Moto Jacket", basePrice: 1250.0 },
      { id: "OUT-03", name: "Waterproof Quilted Down Parka with Fur Hood", basePrice: 720.0 },
    ],
    "Runway Dresses & Suits": [
      { id: "DRS-01", name: "Silk Crepe de Chine Evening Slip Dress", basePrice: 650.0 },
      { id: "DRS-02", name: "Italian Wool Tailored Two-Button Blazer", basePrice: 580.0 },
      { id: "DRS-03", name: "Structured Pleated Midi Cocktail Dress", basePrice: 490.0 },
    ],
    "Handcrafted Footwear": [
      { id: "FTW-01", name: "Italian Hand-Burnished Calfskin Oxford Shoes", basePrice: 480.0 },
      { id: "FTW-02", name: "Pointed-Toe Suede Stiletto Pumps 90mm", basePrice: 520.0 },
      { id: "FTW-03", name: "Goodyear-Welted Chelsea Leather Boots", basePrice: 440.0 },
    ],
    "Luxury Leather Bags": [
      { id: "BAG-01", name: "Grained Calfskin Structured Shoulder Flap Bag", basePrice: 1450.0 },
      { id: "BAG-02", name: "Monogram Embossed Leather Weekender Holdall", basePrice: 980.0 },
      { id: "BAG-03", name: "Minimalist Saffiano Leather Document Briefcase", basePrice: 680.0 },
    ],
    "Fine Jewelry & Watches": [
      { id: "JWL-01", name: "18k Yellow Gold Diamond Tennis Bracelet", basePrice: 2400.0 },
      { id: "JWL-02", name: "Swiss Automatic Chronograph Sapphire Watch", basePrice: 1850.0 },
      { id: "JWL-03", name: "South Sea Cultured Pearl Drop Earrings", basePrice: 790.0 },
    ],
    "Haute Fragrances": [
      { id: "FRG-01", name: "Oud & Damask Rose Extrait de Parfum 100ml", basePrice: 320.0 },
      { id: "FRG-02", name: "Santal & Smoky Cardamom Eau de Parfum 100ml", basePrice: 260.0 },
      { id: "FRG-03", name: "Neroli & Solar Amber Luxury Perfume 100ml", basePrice: 285.0 },
    ],
  },
};

export function generateDatasetFromPreset(presetId: string): RawTransaction[] {
  const preset = DATASET_PRESETS.find((p) => p.id === presetId) || DATASET_PRESETS[0];
  const catalog = PRESET_PRODUCTS[preset.id] || PRESET_PRODUCTS.omnichannel;
  const categories = Object.keys(catalog);

  const transactions: RawTransaction[] = [];
  const numCustomers = preset.customerCount;

  // Synthesize 4 distinct demographic & behavioral customer profiles
  const profiles = Array.from({ length: numCustomers }, (_, i) => {
    const custId = `CUST-${preset.id.slice(0, 3).toUpperCase()}-${String(1001 + i)}`;
    const clusterBias = i % 4;

    let ageGroup = "25-34";
    let region = "North America";
    let primaryCats: string[] = [];

    if (clusterBias === 0) {
      ageGroup = i % 2 === 0 ? "18-24" : "25-34";
      region = i % 2 === 0 ? "West Coast" : "East Coast";
      primaryCats = [categories[0], categories[1]].filter(Boolean);
    } else if (clusterBias === 1) {
      ageGroup = i % 2 === 0 ? "35-44" : "45-54";
      region = i % 2 === 0 ? "Midwest" : "Pacific NW";
      primaryCats = [categories[2], categories[3]].filter(Boolean);
    } else if (clusterBias === 2) {
      ageGroup = i % 2 === 0 ? "35-44" : "55+";
      region = i % 2 === 0 ? "South" : "Mountain West";
      primaryCats = [categories[4], categories[5] || categories[0]].filter(Boolean);
    } else {
      ageGroup = i % 2 === 0 ? "25-34" : "18-24";
      region = i % 2 === 0 ? "Northeast" : "Metro South";
      primaryCats = [categories[categories.length - 1], categories[categories.length - 2] || categories[1]].filter(Boolean);
    }

    return { custId, ageGroup, region, primaryCats };
  });

  let txCounter = 7001;
  const startDate = new Date("2024-01-10").getTime();
  const endDate = new Date("2024-11-01").getTime();

  while (transactions.length < preset.targetRows) {
    const cust = profiles[Math.floor(Math.random() * profiles.length)];
    const txId = `TX-${txCounter++}`;
    const txTime = new Date(startDate + Math.random() * (endDate - startDate));
    const txDate = txTime.toISOString().split("T")[0];

    const basketSize = Math.floor(Math.random() * 3) + 1;
    const basketCategories = new Set<string>();

    for (let b = 0; b < basketSize; b++) {
      if (Math.random() < 0.82 && cust.primaryCats.length > 0) {
        basketCategories.add(cust.primaryCats[Math.floor(Math.random() * cust.primaryCats.length)]);
      } else {
        basketCategories.add(categories[Math.floor(Math.random() * categories.length)]);
      }
    }

    for (const catName of Array.from(basketCategories)) {
      const itemsInCat = catalog[catName] || [];
      if (itemsInCat.length === 0) continue;

      const product = itemsInCat[Math.floor(Math.random() * itemsInCat.length)];
      const qty = Math.random() < 0.8 ? 1 : Math.floor(Math.random() * 2) + 2;
      const jitter = Math.round((Math.random() * 0.08 - 0.04) * product.basePrice * 100) / 100;
      const unitPrice = Math.max(1.99, Math.round((product.basePrice + jitter) * 100) / 100);

      transactions.push({
        transaction_id: txId,
        customer_id: cust.custId,
        product_id: product.id,
        product_name: product.name,
        product_category: catName,
        quantity: qty,
        unit_price: unitPrice,
        transaction_date: txDate,
        customer_age_group: cust.ageGroup,
        region: cust.region,
      });

      if (transactions.length >= preset.targetRows) break;
    }
  }

  return transactions;
}

export const PRELOADED_SAMPLE_DATASET: RawTransaction[] = generateDatasetFromPreset("omnichannel");

export function exportDatasetToCSV(rows: RawTransaction[]): string {
  const headers = [
    "transaction_id",
    "customer_id",
    "product_id",
    "product_name",
    "product_category",
    "quantity",
    "unit_price",
    "transaction_date",
    "customer_age_group",
    "region",
  ];

  const lines = [headers.join(",")];
  for (const r of rows) {
    const line = [
      `"${r.transaction_id}"`,
      `"${r.customer_id}"`,
      `"${r.product_id}"`,
      `"${(r.product_name || "").replace(/"/g, '""')}"`,
      `"${r.product_category}"`,
      r.quantity,
      r.unit_price,
      `"${r.transaction_date}"`,
      `"${r.customer_age_group}"`,
      `"${r.region}"`,
    ];
    lines.push(line.join(","));
  }
  return lines.join("\n");
}
