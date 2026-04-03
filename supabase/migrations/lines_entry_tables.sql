-- ============================================================
-- Lines Entry Tables Migration (v2)
-- Run this in your Supabase SQL Editor
-- Drops old tables if they exist and recreates with correct schema
-- ============================================================

-- Drop old tables if they exist (safe for fresh installs)
DROP TABLE IF EXISTS lines_entry_sublots CASCADE;
DROP TABLE IF EXISTS lines_entry CASCADE;

-- 1. Master lines_entry table
CREATE TABLE lines_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Renamed from entry_no to lot_no, now UNIQUE per organization
  lot_no TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  item_name TEXT,
  supplier TEXT,
  description_ref TEXT,

  -- Lines core fields
  no_of_lines INTEGER,
  line_length_inch NUMERIC(12, 4),
  line_length_mm NUMERIC(12, 4),
  line_length_cm NUMERIC(12, 4),

  -- Master selection
  selection_lines INTEGER,
  selection_length_inch NUMERIC(12, 4),
  selection_length_mm NUMERIC(12, 4),
  selection_length_cm NUMERIC(12, 4),

  -- Master rejection
  rejection_lines INTEGER,
  rejection_length_inch NUMERIC(12, 4),
  rejection_length_mm NUMERIC(12, 4),
  rejection_length_cm NUMERIC(12, 4),

  -- Bunch = number of sublots (0 = none, 5 = five sublots, etc.)
  bunch INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, lot_no)
);

-- 2. Sublot entries (N rows per master when bunch = N)
CREATE TABLE lines_entry_sublots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lines_entry_id UUID NOT NULL REFERENCES lines_entry(id) ON DELETE CASCADE,
  sublot_no TEXT,                     -- e.g. "LE-001-1", "LE-001-2"
  sublot_index INTEGER DEFAULT 1,     -- 1-based position within the bunch

  -- Received selection (filled in separately per sublot)
  selection_lines INTEGER,
  selection_length_inch NUMERIC(12, 4),
  selection_length_mm NUMERIC(12, 4),
  selection_length_cm NUMERIC(12, 4),

  -- Received rejection
  rejection_lines INTEGER,
  rejection_length_inch NUMERIC(12, 4),
  rejection_length_mm NUMERIC(12, 4),
  rejection_length_cm NUMERIC(12, 4),

  -- Track if this sublot's selection was sent to Finished Goods
  sent_to_finished_goods BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, sublot_no)
);

-- 3. Indexes
CREATE INDEX idx_lines_entry_org ON lines_entry(organization_id);
CREATE INDEX idx_lines_entry_date ON lines_entry(date DESC);
CREATE INDEX idx_lines_entry_sublots_entry ON lines_entry_sublots(lines_entry_id);
CREATE INDEX idx_lines_entry_sublots_org ON lines_entry_sublots(organization_id);
CREATE INDEX idx_lines_entry_sublots_index ON lines_entry_sublots(lines_entry_id, sublot_index);

-- 4. Row Level Security
ALTER TABLE lines_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines_entry_sublots ENABLE ROW LEVEL SECURITY;

-- 5. Allow service role full access (used by supabaseAdmin)
CREATE POLICY "service_role_lines_entry" ON lines_entry
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role_lines_entry_sublots" ON lines_entry_sublots
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Done! The Lines Entry module is now ready.
-- 
-- Flow:
--   Purchase page (Lines Entry tab) → create entry with Bunch = N
--   → N sublots auto-created (LOT-1 through LOT-N)
--   → Open entry detail → fill each sublot's selection + rejection
--   → Click "→ FG" on a sublot → marks it as sent to Finished Goods
--   → View in Finished Goods → can then go to Manufacturing
-- ============================================================
