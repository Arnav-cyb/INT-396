export interface RawTransaction {
  transaction_id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  product_category: string;
  quantity: number | string;
  unit_price: number | string;
  transaction_date: string;
  customer_age_group: string;
  region: string;
  [key: string]: any;
}

export interface CleanTransaction {
  transaction_id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  product_category: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  customer_age_group: string;
  region: string;
}

export interface CustomerFeatureVector {
  customerId: string;
  features: number[];
  featureNames: string[];
  totalSpend: number;
  transactionCount: number;
  itemCount: number;
  avgBasketSize: number;
  categoryFrequencies: Record<string, number>;
  categorySpend: Record<string, number>;
  ageGroup: string;
  region: string;
  pcaCoords?: [number, number];
  cluster?: number;
}

export interface ClusterSummary {
  clusterId: number;
  name: string;
  archetype: string;
  customerCount: number;
  percentage: number;
  totalSpend: number;
  avgCustomerSpend: number;
  avgBasketSize: number;
  avgTransactions: number;
  topCategories: { category: string; share: number; avgSpend: number }[];
  dominantAgeGroup: string;
  dominantRegion: string;
  description: string;
  color: string;
}

export interface ClusteringModelResult {
  algorithm: "kmeans" | "dbscan";
  k?: number;
  eps?: number;
  minSamples?: number;
  clusters: ClusterSummary[];
  customerAssignments: Record<string, number>;
  silhouetteScore: number;
  daviesBouldinIndex: number;
  inertia?: number;
  noiseCount: number;
  executionTimeMs: number;
  pcaPoints: Array<{
    customerId: string;
    x: number;
    y: number;
    cluster: number;
    clusterName: string;
    totalSpend: number;
    dominantCategory: string;
  }>;
}

export interface FrequentItemset {
  items: string[];
  support: number;
  count: number;
  clusterId?: number | "global";
}

export interface AssociationRule {
  id: string;
  clusterId: number | "global";
  clusterName: string;
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number;
  antecedentSupport: number;
  consequentSupport: number;
  count: number;
  totalTransactions: number;
  businessAction: string;
  chiSquare?: number;
  pValue?: number;
  significanceLabel?: string;
}

export interface CrossClusterComparisonRule {
  ruleKey: string;
  antecedent: string[];
  consequent: string[];
  type: "universal" | "cluster_specific" | "emerging" | "divergent";
  dominantClusterId: number;
  dominantClusterName: string;
  globalLift: number;
  maxLift: number;
  minLift: number;
  liftVariance: number;
  clusterStats: Record<
    number,
    {
      clusterName: string;
      support: number;
      confidence: number;
      lift: number;
      isSignificant: boolean;
    }
  >;
  crossSellingOpportunity: string;
  actionRecommendation: string;
}

export interface CategoryMatrixCell {
  source: string;
  target: string;
  coOccurrenceCount: number;
  support: number;
  confidence: number;
  lift: number;
}

export interface NetworkNode {
  id: string;
  label: string;
  group: string;
  value: number; // frequency or spend
  radius: number;
  color: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  lift: number;
  confidence: number;
  support: number;
  color: string;
}

export interface AnalysisPipelineResult {
  datasetMetadata: {
    name: string;
    rowCount: number;
    validRowCount: number;
    uniqueCustomers: number;
    uniqueTransactions: number;
    uniqueProducts: number;
    uniqueCategories: number;
    categories: string[];
    dateRange: { start: string; end: string };
    totalRevenue: number;
  };
  clustering: ClusteringModelResult;
  globalRules: AssociationRule[];
  clusterRules: Record<number, AssociationRule[]>;
  frequentItemsets: Record<string, FrequentItemset[]>;
  crossClusterComparisons: CrossClusterComparisonRule[];
  coOccurrenceMatrix: CategoryMatrixCell[];
  timestamp: string;
}
