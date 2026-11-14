-- Category Association Discovery Across Clustered Transaction Segments
-- Production PostgreSQL & Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    organization VARCHAR(150),
    role VARCHAR(50) DEFAULT 'analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Datasets Table
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    row_count INTEGER DEFAULT 0,
    valid_row_count INTEGER DEFAULT 0,
    storage_path TEXT,
    file_size_bytes BIGINT,
    status VARCHAR(50) DEFAULT 'ready', -- 'uploading', 'processing', 'ready', 'error'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    normalized_name VARCHAR(150) NOT NULL,
    total_sales NUMERIC(14, 2) DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    UNIQUE(dataset_id, normalized_name)
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    product_sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    UNIQUE(dataset_id, product_sku)
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    transaction_code VARCHAR(100) NOT NULL,
    customer_code VARCHAR(100) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    transaction_date DATE NOT NULL,
    customer_age_group VARCHAR(50),
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Analysis Jobs Table
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    algorithm VARCHAR(50) NOT NULL, -- 'kmeans', 'dbscan'
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb, -- { k: 4, minSupport: 0.04, minConfidence: 0.2, minLift: 1.05 }
    silhouette_score NUMERIC(5, 3),
    davies_bouldin_index NUMERIC(5, 3),
    inertia NUMERIC(12, 2),
    execution_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Clusters Table
CREATE TABLE IF NOT EXISTS clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    cluster_index INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    archetype VARCHAR(150),
    customer_count INTEGER NOT NULL,
    percentage NUMERIC(5, 2),
    avg_customer_spend NUMERIC(12, 2),
    avg_basket_size NUMERIC(6, 2),
    dominant_age_group VARCHAR(50),
    dominant_region VARCHAR(100),
    top_categories JSONB DEFAULT '[]'::jsonb,
    centroid JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Association Rules Table
CREATE TABLE IF NOT EXISTS association_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE, -- NULL for global rules
    scope VARCHAR(50) DEFAULT 'global', -- 'global' or 'cluster'
    antecedent JSONB NOT NULL, -- ["Electronics"]
    consequent JSONB NOT NULL, -- ["Computers & Gaming"]
    support NUMERIC(6, 4) NOT NULL,
    confidence NUMERIC(6, 4) NOT NULL,
    lift NUMERIC(8, 4) NOT NULL,
    leverage NUMERIC(8, 4),
    conviction NUMERIC(8, 4),
    support_count INTEGER,
    total_transactions INTEGER,
    classification VARCHAR(50) DEFAULT 'universal', -- 'universal', 'cluster_specific', 'emerging', 'divergent'
    business_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    format VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'csv', 'json'
    summary TEXT,
    storage_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_tx_dataset_id ON transactions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_tx_code ON transactions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_tx_customer ON transactions(customer_code);
CREATE INDEX IF NOT EXISTS idx_rules_job_scope ON association_rules(job_id, scope);
CREATE INDEX IF NOT EXISTS idx_rules_lift ON association_rules(lift DESC);
CREATE INDEX IF NOT EXISTS idx_clusters_job_id ON clusters(job_id);
