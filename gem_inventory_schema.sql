-- GEM INVENTORY MANAGEMENT SYSTEM - FULL SCHEMA
-- This script matches the application services perfectly.

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'STAFF')),
    organization_id UUID REFERENCES organizations(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lots Table
CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number TEXT NOT NULL,
    product_id UUID REFERENCES products(id),
    item_name TEXT,
    supplier_name TEXT,
    category TEXT,
    description_ref TEXT,
    gross_weight DECIMAL(12, 3),
    less_weight DECIMAL(12, 3) DEFAULT 0,
    net_weight DECIMAL(12, 3),
    weight_unit TEXT DEFAULT 'G',
    size TEXT,
    shape TEXT,
    pieces INTEGER,
    lines INTEGER,
    line_length DECIMAL(12, 2),
    quantity INTEGER,
    status TEXT DEFAULT 'IN_STOCK',
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Manufacturing Table
CREATE TABLE IF NOT EXISTS manufacturing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES lots(id),
    issued_to TEXT,
    process_type TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    weight DECIMAL(12, 3),
    weight_unit TEXT DEFAULT 'G',
    pieces INTEGER,
    shape TEXT,
    size TEXT,
    lines INTEGER,
    length DECIMAL(12, 2),
    labour_cost DECIMAL(15, 2) DEFAULT 0,
    other_cost DECIMAL(15, 2) DEFAULT 0,
    total_manufacturing_cost DECIMAL(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'COMPLETED',
    output_quantity INTEGER,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES lots(id),
    supplier TEXT,
    item_name TEXT,
    description_ref TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    gross_weight DECIMAL(12, 3),
    less_weight DECIMAL(12, 3) DEFAULT 0,
    net_weight DECIMAL(12, 3),
    weight_unit TEXT DEFAULT 'G',
    size TEXT,
    shape TEXT,
    pieces INTEGER,
    lines INTEGER,
    line_length DECIMAL(12, 2),
    purchase_price DECIMAL(15, 2),
    total_cost DECIMAL(15, 2),
    cost_per_gram DECIMAL(15, 2),
    rejection_weight DECIMAL(12, 3) DEFAULT 0,
    rejection_pieces INTEGER,
    rejection_lines INTEGER,
    rejection_length DECIMAL(12, 2),
    rejection_date TIMESTAMPTZ,
    rejection_status TEXT DEFAULT 'PENDING',
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES lots(id),
    customer TEXT,
    bill_no TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    item_name TEXT,
    description_ref TEXT,
    weight DECIMAL(12, 3),
    weight_unit TEXT DEFAULT 'G',
    pieces INTEGER,
    shape TEXT,
    size TEXT,
    lines INTEGER,
    length DECIMAL(12, 2),
    sale_price DECIMAL(15, 2),
    discount DECIMAL(15, 2) DEFAULT 0,
    tax DECIMAL(15, 2) DEFAULT 0,
    net_sale DECIMAL(15, 2),
    final_bill_amount DECIMAL(15, 2),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Stock Ledgers Table
CREATE TABLE IF NOT EXISTS stock_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    transaction_type TEXT NOT NULL,
    weight DECIMAL(12, 3),
    quantity INTEGER,
    reference_id UUID,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Rejections Table
CREATE TABLE IF NOT EXISTS rejections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES lots(id),
    weight DECIMAL(12, 3),
    sent_to_manufacturer BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- SCHEMA FIX / MIGRATION (RUN THIS TO ADD MISSING COLUMNS TO EXISTING TABLES)
--------------------------------------------------------------------------------

-- Fix Lots table
ALTER TABLE lots ADD COLUMN IF NOT EXISTS item_name TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS supplier_name TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS description_ref TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS less_weight DECIMAL(12, 3) DEFAULT 0;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'G';
ALTER TABLE lots ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS shape TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS pieces INTEGER;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS lines INTEGER;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS line_length DECIMAL(12, 2);

-- Fix Purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS item_name TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS description_ref TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'G';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(12, 3);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS less_weight DECIMAL(12, 3) DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shape TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS total_cost DECIMAL(15, 2);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS cost_per_gram DECIMAL(15, 2);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS rejection_pieces INTEGER;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS rejection_lines INTEGER;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS rejection_length DECIMAL(12, 2);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMPTZ;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS rejection_status TEXT DEFAULT 'PENDING';

-- Fix Sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS bill_no TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS item_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS description_ref TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'G';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shape TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS lines INTEGER;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS length DECIMAL(12, 2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS net_sale DECIMAL(15, 2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS final_bill_amount DECIMAL(15, 2);
