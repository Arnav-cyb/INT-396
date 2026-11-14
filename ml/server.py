"""
Category Association Discovery Across Clustered Transaction Segments
Python ML Processing Microservice (FastAPI + scikit-learn + mlxtend)

To run locally or deploy to Render/Railway/Fly.io/AWS:
    pip install fastapi uvicorn pandas numpy scikit-learn mlxtend pydantic
    uvicorn ml.server:app --host 0.0.0.0 --port 8000
"""

from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import time

try:
    from sklearn.cluster import KMeans, DBSCAN
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import silhouette_score, davies_bouldin_score
    from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules
    from mlxtend.preprocessing import TransactionEncoder
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

app = FastAPI(
    title="Category Association Discovery ML Service",
    description="Microservice for Customer Segmentation, PCA, and Cross-Cluster Association Rule Mining",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RawTransactionItem(BaseModel):
    transaction_id: str
    customer_id: str
    product_id: Optional[str] = "P-0"
    product_name: Optional[str] = "Item"
    product_category: str
    quantity: float
    unit_price: float
    transaction_date: Optional[str] = "2024-01-01"
    customer_age_group: Optional[str] = "25-34"
    region: Optional[str] = "Global"

class PipelineRequest(BaseModel):
    transactions: List[RawTransactionItem]
    algorithm: Optional[str] = "kmeans"  # "kmeans" or "dbscan"
    k: Optional[int] = 4
    eps: Optional[float] = 1.8
    min_samples: Optional[int] = 4
    rule_algorithm: Optional[str] = "fpgrowth"  # "fpgrowth" or "apriori"
    min_support: Optional[float] = 0.04
    min_confidence: Optional[float] = 0.2
    min_lift: Optional[float] = 1.05

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Category Association Discovery ML Engine",
        "ml_dependencies_loaded": ML_AVAILABLE,
        "timestamp": time.time()
    }

@app.post("/api/ml/analyze")
def run_ml_pipeline(req: PipelineRequest):
    if not ML_AVAILABLE:
        raise HTTPException(status_code=500, detail="Machine learning libraries (scikit-learn/mlxtend) not installed.")

    start_time = time.time()
    raw_data = [item.dict() for item in req.transactions]
    df = pd.DataFrame(raw_data)

    if df.empty:
        raise HTTPException(status_code=400, detail="Empty transaction dataset received.")

    # 1. Clean data
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1)
    df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").fillna(0)
    df = df[(df["quantity"] > 0) & (df["unit_price"] > 0) & (df["product_category"].str.strip() != "")]
    df["total_amount"] = df["quantity"] * df["unit_price"]
    df["product_category"] = df["product_category"].str.strip().str.title()

    all_categories = sorted(df["product_category"].unique().tolist())

    # 2. Customer aggregation
    cust_groups = df.groupby("customer_id")
    cust_metrics = cust_groups.agg({
        "total_amount": "sum",
        "transaction_id": "nunique",
        "quantity": "sum",
        "customer_age_group": "first",
        "region": "first"
    }).rename(columns={"total_amount": "total_spend", "transaction_id": "tx_count", "quantity": "item_count"})

    # Pivot category spend
    cat_pivot = df.pivot_table(index="customer_id", columns="product_category", values="total_amount", aggfunc="sum", fill_value=0)
    for cat in all_categories:
        if cat not in cat_pivot.columns:
            cat_pivot[cat] = 0.0

    # Combine into feature matrix
    features_df = cust_metrics[["total_spend", "tx_count", "item_count"]].join(cat_pivot)
    features_df["avg_basket_spend"] = features_df["total_spend"] / features_df["tx_count"]
    features_df["avg_basket_items"] = features_df["item_count"] / features_df["tx_count"]

    X = features_df.values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 3. Clustering
    if req.algorithm == "kmeans":
        k = max(2, min(req.k or 4, len(features_df)))
        model = KMeans(n_clusters=k, random_state=42, n_init=5)
        labels = model.fit_predict(X_scaled)
        inertia = float(model.inertia_)
    else:
        model = DBSCAN(eps=req.eps or 1.8, min_samples=req.min_samples or 4)
        labels = model.fit_predict(X_scaled)
        inertia = 0.0

    features_df["cluster"] = labels

    # 4. Metrics & PCA
    valid_mask = labels != -1
    sil_score = float(silhouette_score(X_scaled[valid_mask], labels[valid_mask])) if len(set(labels[valid_mask])) > 1 else 0.0
    db_score = float(davies_bouldin_score(X_scaled[valid_mask], labels[valid_mask])) if len(set(labels[valid_mask])) > 1 else 0.0

    pca = PCA(n_components=2)
    pca_coords = pca.fit_transform(X_scaled)

    pca_points = []
    for idx, (custId, row) in enumerate(features_df.iterrows()):
        pca_points.append({
            "customerId": str(custId),
            "x": round(float(pca_coords[idx, 0]), 2),
            "y": round(float(pca_coords[idx, 1]), 2),
            "cluster": int(labels[idx]),
            "clusterName": f"Cluster {int(labels[idx]) + 1}",
            "totalSpend": round(float(row["total_spend"]), 2)
        })

    # 5. Association Rules
    tx_baskets = df.groupby("transaction_id")["product_category"].apply(lambda s: sorted(list(set(s)))).tolist()
    te = TransactionEncoder()
    te_ary = te.fit(tx_baskets).transform(tx_baskets)
    basket_df = pd.DataFrame(te_ary, columns=te.columns_)

    miner = fpgrowth if req.rule_algorithm == "fpgrowth" else apriori
    frequent_itemsets = miner(basket_df, min_support=req.min_support or 0.04, use_colnames=True)
    
    rules = []
    if not frequent_itemsets.empty:
        raw_rules = association_rules(frequent_itemsets, metric="lift", min_threshold=req.min_lift or 1.05)
        raw_rules = raw_rules[raw_rules["confidence"] >= (req.min_confidence or 0.2)]
        for _, r in raw_rules.iterrows():
            rules.append({
                "id": f"py-rule-{len(rules)}",
                "clusterId": "global",
                "clusterName": "All Customers",
                "antecedent": list(r["antecedents"]),
                "consequent": list(r["consequents"]),
                "support": round(float(r["support"]), 3),
                "confidence": round(float(r["confidence"]), 3),
                "lift": round(float(r["lift"]), 2),
                "leverage": round(float(r["leverage"]), 3),
                "conviction": round(float(min(r["conviction"], 99.99)), 2),
                "businessAction": f"Cross-promote {', '.join(r['consequents'])} when purchasing {', '.join(r['antecedents'])}"
            })

    return {
        "datasetMetadata": {
            "rowCount": len(df),
            "uniqueCustomers": len(features_df),
            "uniqueTransactions": df["transaction_id"].nunique(),
            "uniqueCategories": len(all_categories),
            "categories": all_categories,
            "totalRevenue": round(float(df["total_amount"].sum()), 2)
        },
        "clustering": {
            "algorithm": req.algorithm,
            "silhouetteScore": round(sil_score, 3),
            "daviesBouldinIndex": round(db_score, 3),
            "inertia": round(inertia, 2),
            "pcaPoints": pca_points,
            "executionTimeMs": int((time.time() - start_time) * 1000)
        },
        "globalRules": rules,
        "timestamp": time.time()
    }
