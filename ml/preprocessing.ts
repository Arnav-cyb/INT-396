import { CleanTransaction, CustomerFeatureVector, RawTransaction } from "../lib/types";

export interface PreprocessingSummary {
  totalRawRows: number;
  validRows: number;
  invalidRowsRemoved: number;
  duplicatesRemoved: number;
  uniqueCustomers: number;
  uniqueTransactions: number;
  categories: string[];
  featuresList: string[];
  revenueTotal: number;
}

export function cleanTransactions(rawRows: RawTransaction[]): {
  cleaned: CleanTransaction[];
  summary: PreprocessingSummary;
  basketsByTransaction: Map<string, { customerId: string; categories: Set<string>; date: string }>;
  customerProfiles: CustomerFeatureVector[];
} {
  const seenRowKeys = new Set<string>();
  const cleaned: CleanTransaction[] = [];
  let invalidRows = 0;
  let duplicateRows = 0;

  for (const row of rawRows) {
    const txId = String(row.transaction_id || row.Transaction_ID || row.TransactionId || "").trim();
    const custId = String(row.customer_id || row.Customer_ID || row.CustomerId || "").trim();
    const prodId = String(row.product_id || row.Product_ID || row.ProductId || "P-DEFAULT").trim();
    const prodName = String(row.product_name || row.Product_Name || row.ProductName || "Item").trim();
    let category = String(row.product_category || row.Product_Category || row.Category || "").trim();
    
    // Normalize category
    if (!category) {
      invalidRows++;
      continue;
    }
    category = category.charAt(0).toUpperCase() + category.slice(1);

    const qty = Number(row.quantity || row.Quantity || 1);
    const price = Number(row.unit_price || row.Unit_Price || row.UnitPrice || 0);

    if (!txId || !custId || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      invalidRows++;
      continue;
    }

    // Check duplicate
    const dedupeKey = `${txId}|${custId}|${prodId}|${category}|${qty}|${price}`;
    if (seenRowKeys.has(dedupeKey)) {
      duplicateRows++;
      continue;
    }
    seenRowKeys.add(dedupeKey);

    const dateStr = String(row.transaction_date || row.Transaction_Date || row.Date || "2024-01-01").trim();
    const ageGroup = String(row.customer_age_group || row.Customer_Age_Group || row.AgeGroup || "25-34").trim();
    const region = String(row.region || row.Region || "North America").trim();

    cleaned.push({
      transaction_id: txId,
      customer_id: custId,
      product_id: prodId,
      product_name: prodName,
      product_category: category,
      quantity: qty,
      unit_price: price,
      total_amount: Math.round(qty * price * 100) / 100,
      transaction_date: dateStr,
      customer_age_group: ageGroup,
      region: region,
    });
  }

  // Group into transaction baskets
  const basketsByTransaction = new Map<string, { customerId: string; categories: Set<string>; date: string }>();
  for (const item of cleaned) {
    let basket = basketsByTransaction.get(item.transaction_id);
    if (!basket) {
      basket = {
        customerId: item.customer_id,
        categories: new Set<string>(),
        date: item.transaction_date,
      };
      basketsByTransaction.set(item.transaction_id, basket);
    }
    basket.categories.add(item.product_category);
  }

  // Find unique categories
  const allCategories = Array.from(new Set(cleaned.map((t) => t.product_category))).sort();

  // Aggregate by customer
  const customerMap = new Map<
    string,
    {
      totalSpend: number;
      txSet: Set<string>;
      itemCount: number;
      categorySpend: Record<string, number>;
      categoryCounts: Record<string, number>;
      ageGroup: string;
      region: string;
    }
  >();

  for (const item of cleaned) {
    let c = customerMap.get(item.customer_id);
    if (!c) {
      c = {
        totalSpend: 0,
        txSet: new Set<string>(),
        itemCount: 0,
        categorySpend: {},
        categoryCounts: {},
        ageGroup: item.customer_age_group,
        region: item.region,
      };
      for (const cat of allCategories) {
        c.categorySpend[cat] = 0;
        c.categoryCounts[cat] = 0;
      }
      customerMap.set(item.customer_id, c);
    }

    c.totalSpend += item.total_amount;
    c.txSet.add(item.transaction_id);
    c.itemCount += item.quantity;
    c.categorySpend[item.product_category] = (c.categorySpend[item.product_category] || 0) + item.total_amount;
    c.categoryCounts[item.product_category] = (c.categoryCounts[item.product_category] || 0) + 1;
  }

  // Construct Feature Vectors
  const featureNames: string[] = [
    "total_spend",
    "transaction_count",
    "avg_basket_spend",
    "avg_items_per_basket",
    ...allCategories.map((c) => `cat_share_${c.toLowerCase().replace(/[^a-z0-9]/g, "_")}`),
  ];

  const customerProfiles: CustomerFeatureVector[] = [];
  let totalRevenue = 0;

  customerMap.forEach((c, custId) => {
    const txCount = c.txSet.size;
    const avgBasketSpend = txCount > 0 ? c.totalSpend / txCount : 0;
    const avgItems = txCount > 0 ? c.itemCount / txCount : 0;
    totalRevenue += c.totalSpend;

    const catShares = allCategories.map((cat) => {
      return c.totalSpend > 0 ? (c.categorySpend[cat] || 0) / c.totalSpend : 0;
    });

    const rawFeatures = [
      Math.round(c.totalSpend * 100) / 100,
      txCount,
      Math.round(avgBasketSpend * 100) / 100,
      Math.round(avgItems * 100) / 100,
      ...catShares.map((s) => Math.round(s * 1000) / 1000),
    ];

    customerProfiles.push({
      customerId: custId,
      features: rawFeatures,
      featureNames,
      totalSpend: Math.round(c.totalSpend * 100) / 100,
      transactionCount: txCount,
      itemCount: c.itemCount,
      avgBasketSize: Math.round(avgItems * 10) / 10,
      categoryFrequencies: c.categoryCounts,
      categorySpend: c.categorySpend,
      ageGroup: c.ageGroup,
      region: c.region,
    });
  });

  const summary: PreprocessingSummary = {
    totalRawRows: rawRows.length,
    validRows: cleaned.length,
    invalidRowsRemoved: invalidRows,
    duplicatesRemoved: duplicateRows,
    uniqueCustomers: customerProfiles.length,
    uniqueTransactions: basketsByTransaction.size,
    categories: allCategories,
    featuresList: featureNames,
    revenueTotal: Math.round(totalRevenue * 100) / 100,
  };

  return { cleaned, summary, basketsByTransaction, customerProfiles };
}

export class StandardScaler {
  means: number[] = [];
  stds: number[] = [];

  fitTransform(data: number[][]): number[][] {
    if (data.length === 0) return [];
    const n = data.length;
    const numFeatures = data[0].length;

    this.means = new Array(numFeatures).fill(0);
    this.stds = new Array(numFeatures).fill(0);

    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += data[i][j];
      }
      this.means[j] = sum / n;

      let varianceSum = 0;
      for (let i = 0; i < n; i++) {
        const diff = data[i][j] - this.means[j];
        varianceSum += diff * diff;
      }
      const variance = varianceSum / n;
      this.stds[j] = variance > 1e-7 ? Math.sqrt(variance) : 1;
    }

    return data.map((row) =>
      row.map((val, j) => (val - this.means[j]) / this.stds[j])
    );
  }

  transform(row: number[]): number[] {
    return row.map((val, j) => (val - (this.means[j] || 0)) / (this.stds[j] || 1));
  }
}
