# Category Association Discovery Across Clustered Transaction Segments

An enterprise-grade, full-stack AI/ML analytics platform that discovers non-obvious product-category relationships across customer transaction cohorts using **Unsupervised Machine Learning (K-Means, DBSCAN)**, **Dimensionality Reduction (PCA)**, and **Frequent Pattern Mining (FP-Growth, Apriori)**.

---

## 🌟 Executive Overview

Traditional Association Rule Mining (Market Basket Analysis) mines transactions across an entire catalog as a single monolithic block. This frequently obscures critical niche affinities or produces misleading rules because diverse customer segments exhibit drastically different purchasing behaviors.

**Category Association Discovery Across Clustered Transaction Segments** solves this by:
1. Transforming raw transaction line items into standardized customer behavioral vectors (monetary spend, basket depth, and cross-category wallet shares).
2. Segmenting customers into natural behavioral clusters using **K-Means++** or **DBSCAN**.
3. Projecting multi-dimensional customer features into an interactive 2D coordinate space using **Principal Component Analysis (PCA)**.
4. Mining frequent category itemsets separately for each customer segment as well as catalog-wide using **FP-Growth** and **Apriori**.
5. Executing **Cross-Cluster Differential Rule Mining** to classify association patterns as **Universal**, **Cluster-Specific**, **Divergent**, or **Emerging**.
6. Delivering actionable merchandising prescriptions, automated bundle configurations, and interactive network topological graphs.

---

## 🛠️ Architecture & Tech Stack

- **Frontend & App Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling & UI Components**: Tailwind CSS, Lucide Icons, Framer Motion
- **Visualizations**: Interactive SVG Topology Network Graph, 2D PCA Scatter Plot with Bounding Box Projection, Bivariate Co-Occurrence Heatmap
- **ML & Data Mining Engine**:
  - **Embedded Pipeline**: Zero-config high-performance TypeScript ML engine designed for seamless single-click deployment on **Vercel**.
  - **Standalone Python Microservice**: `ml/server.py` (FastAPI, scikit-learn, mlxtend, pandas, numpy) for containerized deployments on Render, Railway, or AWS.
- **Database Architecture**: PostgreSQL & Supabase DDL schema in `db/schema.sql` (9 tables, foreign keys, triggers, and B-tree indexes).

---

## 📊 Core Modules

1. **Overview Dashboard** (`/`)
   - High-level KPIs: Total Transactions, Customer Count, Catalog Categories, Discovered Clusters, Association Rules Found.
   - Diagnostic metrics: Silhouette Score, Davies-Bouldin Index, Mean Rule Lift, Mean Confidence.
   - Interactive PCA 2D scatter plot snapshot and top-lift association rule rankings.

2. **Dataset Management** (`/datasets`)
   - Client-side and server-side CSV upload and parsing via PapaParse.
   - Schema validation, missing-value detection, and duplicate removal.
   - Interactive paginated data table with real-time category filtering.
   - One-click export of cleaned and processed transaction datasets.

3. **Customer Segmentation** (`/segmentation`)
   - Dual clustering algorithms: **K-Means** (configurable $k$, $n_{\text{init}}$, Lloyd's iteration) and **DBSCAN** (configurable $\varepsilon$ radius and MinPts).
   - Mathematical clustering validation: **Silhouette Score** ($s \in [-1, 1]$) and **Davies-Bouldin Index**.
   - PCA 2D projection scatter plot with cluster-based color encoding and customer-level hover tooltips.
   - Segment comparison table detailing customer count, percentage share, average spend, and dominant product affinities.

4. **New-User Product Recommendations** (`/recommendations`)
   - Cold-start personalization engine for first-time shoppers without historical transaction data.
   - Dynamic preference profiler: category selection, budget ceiling bounds, and target shopper personas.
   - Multi-factor recommendation scoring:
     $$\text{Score} = 100 \times [ (0.35 \times S_{\text{segment}}) + (0.25 \times L_{\text{norm\_rule}}) + (0.20 \times P_{\text{norm\_pop}}) + (0.15 \times M_{\text{pref}}) + (0.05 \times B_{\text{budget}}) ]$$
   - FP-Growth cross-sell synergy expansion connecting antecedent preferences to high-lift consequents.
   - Transparent human-readable explanations with explicit statistical metrics and factor contribution bars.
   - Interactive 4-stage pipeline visualizer, segment affinity comparison chart, and CSV export.

5. **Upgraded Ask Copilot (AI Intelligence)**
   - Conversational assistant embedded across the entire application with stateful memory and context awareness.
   - Direct natural-language product recommendations: extracts categories, budgets, and cluster references to generate structured recommendation cards in chat.
   - Contextual follow-up support: handles "Why was this recommended?", "Show alternatives", "What if the budget is lower?", "Compare these recommendations", "Which segment is this based on?", and "Give me a marketing strategy".
   - Honest, data-grounded responses that prevent statistical hallucination.

6. **Association Rule Mining** (`/association-rules`)
   - Configurable algorithm selection: **FP-Growth** (Frequent Pattern Tree) vs **Apriori** (Candidate Generation).
   - Dynamic threshold controls: Minimum Support ($s$), Minimum Confidence ($c$), and Minimum Lift.
   - Comprehensive rule metrics: Support, Confidence, Lift, Leverage, and Conviction.
   - Filterable by cohort scope: Global catalog vs individual customer segments.

7. **Cross-Cluster Association Discovery** (`/cross-cluster`)
   - Differential rule analysis comparing lift and support across discovered segments.
   - Pattern classification:
     - **Universal**: Consistent, strong association across all customer groups.
     - **Cluster-Specific**: High-affinity relationship observed exclusively within one segment.
     - **Divergent**: Significant variance in lift across demographics.
     - **Emerging**: Growing affinity in early-adoption cohorts.
   - Full symmetric category co-occurrence matrix heatmap with metric toggles (Lift, Confidence, Support, Frequency).

8. **Network Graph** (`/network`)
   - Interactive topological category network.
   - Nodes represent product categories with radius proportional to catalog centrality.
   - Edges represent association strength with thickness and opacity scaled by lift.
   - Radial layout with interactive node isolation, edge hover inspection, and minimum lift filtering.

9. **Business Insights & Merchandising** (`/insights`)
   - Prescriptive product bundling configurations with expected uplift.
   - Targeted checkout cross-selling recommendations tailored to specific segments.
   - Customer segment growth blueprints and retention strategies.

10. **Reports & Exports** (`/reports`)
    - Printable executive audit reports with print-optimized CSS layout.
    - One-click CSV export of discovered association rules and transaction records.

11. **Settings & Configuration** (`/settings`)
    - Hyperparameter management: $k$, $\varepsilon$, MinPts, Support, Confidence, Lift.
    - Theme switching (Light / Dark mode) with local storage persistence.
    - Optional routing to external Python FastAPI microservice.
   - Database connection status and schema reference.

---

## 📐 Mathematical & Algorithmic Foundations

### 1. Feature Engineering & Standard Scaling
For each customer $i$, we compute a feature vector $\mathbf{x}_i \in \mathbb{R}^p$ encompassing total monetary spend, transaction count, average basket depth, and relative category spend shares $\frac{\text{Spend}_{i, c}}{\text{TotalSpend}_i}$.
Features are normalized using `StandardScaler`:
$$z_{i, j} = \frac{x_{i, j} - \mu_j}{\sigma_j}$$

### 2. K-Means++ Clustering
Initial centroids $c_1, \dots, c_k$ are seeded with probability proportional to squared distance:
$$P(x) = \frac{D(x)^2}{\sum_{x' \in X} D(x')^2}$$
Data points are iteratively assigned to the closest centroid by Euclidean distance, minimizing inertia:
$$\mathcal{J} = \sum_{i=1}^n \min_{c \in C} \|x_i - c\|^2$$

### 3. Principal Component Analysis (PCA)
Computes the covariance matrix $\mathbf{\Sigma} = \frac{1}{n-1} \mathbf{X}_c^T \mathbf{X}_c$ and derives top eigenvectors $\mathbf{v}_1, \mathbf{v}_2$ using power iteration with Rayleigh quotient deflation to project high-dimensional customer vectors to $\mathbb{R}^2$.

### 4. Association Rule Metrics
Given antecedent $A$ and consequent $B$:
- **Support**:
  $$\text{Supp}(A \Rightarrow B) = P(A \cup B) = \frac{|\{t \in T \mid A \cup B \subseteq t\}|}{|T|}$$
- **Confidence**:
  $$\text{Conf}(A \Rightarrow B) = P(B \mid A) = \frac{\text{Supp}(A \cup B)}{\text{Supp}(A)}$$
- **Lift**:
  $$\text{Lift}(A \Rightarrow B) = \frac{P(B \mid A)}{P(B)} = \frac{\text{Supp}(A \cup B)}{\text{Supp}(A) \times \text{Supp}(B)}$$
- **Leverage**:
  $$\text{Lev}(A \Rightarrow B) = \text{Supp}(A \cup B) - \text{Supp}(A) \times \text{Supp}(B)$$
- **Conviction**:
  $$\text{Conv}(A \Rightarrow B) = \frac{1 - \text{Supp}(B)}{1 - \text{Conf}(A \Rightarrow B)}$$

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### 1. Installation
```bash
git clone https://github.com/Arnav-cyb/INT-396.git
cd INT-396
npm install
```

### 2. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app starts immediately with a preloaded synthetic benchmark dataset of 1,850 realistic retail transactions.

### 3. Running Production Build
```bash
npm run build
npm run start
```

### 4. Running Automated Tests
```bash
npm test
```
Executes the master verification suite covering:
- Cold-start recommendation engine (14 test scenarios, 27 assertions).
- Ask Copilot natural language processing, recommendation generation, and conversational follow-ups (6 test suites, 19 assertions).
- Full pass rate (46/46 assertions passing).

---

## 🐍 Standalone Python ML Microservice (Optional)

If you wish to run the separate Python FastAPI microservice:
```bash
# Install Python dependencies
pip install fastapi uvicorn pandas numpy scikit-learn mlxtend pydantic

# Launch microservice
uvicorn ml.server:app --host 0.0.0.0 --port 8000
```
Then configure in `.env.local`:
```env
PYTHON_ML_SERVICE_URL=http://localhost:8000
```
Enable the toggle under `/settings` to route analysis requests to the Python engine.

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Connect to your PostgreSQL database or Supabase project.
2. Execute the DDL script in [`db/schema.sql`](file:///./db/schema.sql).
3. Set your connection variables in `.env.local`:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚢 Deployment to Vercel

The application is fully architected for zero-configuration deployment to [Vercel](https://vercel.com/):
1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Framework Preset: **Next.js**.
4. Build Command: `next build`.
5. Output Directory: `.next`.
6. Click **Deploy**.

---

## 📄 License
MIT License. Open source and suitable for university research, enterprise portfolio demonstrations, and commercial retail intelligence deployments.
