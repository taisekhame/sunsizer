-- =============================================================================
-- SunSizer — Seed Components & Prices
-- ALL prices are PLACEHOLDER values from the PDF guides (not real market prices).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- INVERTERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.components (id, category, brand, model, specs, verified, active) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'INVERTER', 'Generic', '1.5 kVA Hybrid Inverter', '{"kva": 1.5, "voltage": 24}', false, true),
  ('c0000001-0000-0000-0000-000000000002', 'INVERTER', 'Generic', '2.5 kVA Hybrid Inverter', '{"kva": 2.5, "voltage": 24}', false, true),
  ('c0000001-0000-0000-0000-000000000003', 'INVERTER', 'Generic', '3.5 kVA Hybrid Inverter', '{"kva": 3.5, "voltage": 24}', false, true),
  ('c0000001-0000-0000-0000-000000000004', 'INVERTER', 'Generic', '5 kVA Hybrid Inverter', '{"kva": 5, "voltage": 48}', false, true),
  ('c0000001-0000-0000-0000-000000000005', 'INVERTER', 'Generic', '6 kVA Hybrid Inverter', '{"kva": 6, "voltage": 48}', false, true),
  ('c0000001-0000-0000-0000-000000000006', 'INVERTER', 'Generic', '7.5 kVA Hybrid Inverter', '{"kva": 7.5, "voltage": 48}', false, true),
  ('c0000001-0000-0000-0000-000000000007', 'INVERTER', 'Generic', '10 kVA Hybrid Inverter', '{"kva": 10, "voltage": 48}', false, true),
  ('c0000001-0000-0000-0000-000000000008', 'INVERTER', 'Generic', '15 kVA Hybrid Inverter', '{"kva": 15, "voltage": 48}', false, true),
  ('c0000001-0000-0000-0000-000000000009', 'INVERTER', 'Generic', '20 kVA Hybrid Inverter', '{"kva": 20, "voltage": 48}', false, true),
  ('c0000001-0000-0000-0000-000000000010', 'INVERTER', 'Generic', '30 kVA Hybrid Inverter', '{"kva": 30, "voltage": 48}', false, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- BATTERIES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.components (id, category, brand, model, specs, verified, active) VALUES
  ('c0000002-0000-0000-0000-000000000001', 'BATTERY', 'Generic', 'Lithium LiFePO4 51.2V 100Ah (5.12 kWh)', '{"type": "lithium", "voltage": 51.2, "ah": 100, "kwh": 5.12}', false, true),
  ('c0000002-0000-0000-0000-000000000002', 'BATTERY', 'Generic', 'Tubular Lead-Acid 12V 220Ah', '{"type": "tubular", "voltage": 12, "ah": 220}', false, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- PANELS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.components (id, category, brand, model, specs, verified, active) VALUES
  ('c0000003-0000-0000-0000-000000000001', 'PANEL', 'Generic', '550W Monocrystalline Solar Panel', '{"watts": 550}', false, true),
  ('c0000003-0000-0000-0000-000000000002', 'PANEL', 'Generic', '620W Monocrystalline Solar Panel', '{"watts": 620}', false, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- ACCESSORIES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.components (id, category, brand, model, specs, verified, active) VALUES
  ('c0000004-0000-0000-0000-000000000001', 'ACCESSORY', 'Generic', 'DC Protection Set', '{"type": "dc_protection"}', false, true),
  ('c0000004-0000-0000-0000-000000000002', 'ACCESSORY', 'Generic', 'Cables Set', '{"type": "cables"}', false, true),
  ('c0000004-0000-0000-0000-000000000003', 'ACCESSORY', 'Generic', 'Mounting Materials Set', '{"type": "mounting"}', false, true),
  ('c0000004-0000-0000-0000-000000000004', 'ACCESSORY', 'Generic', 'Installation Labour', '{"type": "labour"}', false, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- PRICES (PLACEHOLDER — all marked is_placeholder = true)
-- From the PDFs: 10 kVA inverter ₦2,500,000 · lithium battery ₦1,500,000 ·
-- 620W panel ₦180,000 · DC protection ₦150,000 · cables ₦200,000 ·
-- mounting ₦250,000 · installation labour ₦250,000.
-- Other prices are invented equivalents.
-- ─────────────────────────────────────────────────────────────────────────────

-- Inverter prices
INSERT INTO public.prices (component_id, unit_price, is_placeholder) VALUES
  ('c0000001-0000-0000-0000-000000000001', 650000, true),
  ('c0000001-0000-0000-0000-000000000002', 900000, true),
  ('c0000001-0000-0000-0000-000000000003', 1200000, true),
  ('c0000001-0000-0000-0000-000000000004', 1500000, true),
  ('c0000001-0000-0000-0000-000000000005', 1800000, true),
  ('c0000001-0000-0000-0000-000000000006', 2100000, true),
  ('c0000001-0000-0000-0000-000000000007', 2500000, true),
  ('c0000001-0000-0000-0000-000000000008', 3800000, true),
  ('c0000001-0000-0000-0000-000000000009', 5000000, true),
  ('c0000001-0000-0000-0000-000000000010', 7500000, true);

-- Battery prices
INSERT INTO public.prices (component_id, unit_price, is_placeholder) VALUES
  ('c0000002-0000-0000-0000-000000000001', 1500000, true),
  ('c0000002-0000-0000-0000-000000000002', 320000, true);

-- Panel prices
INSERT INTO public.prices (component_id, unit_price, is_placeholder) VALUES
  ('c0000003-0000-0000-0000-000000000001', 160000, true),
  ('c0000003-0000-0000-0000-000000000002', 180000, true);

-- Accessory prices
INSERT INTO public.prices (component_id, unit_price, is_placeholder) VALUES
  ('c0000004-0000-0000-0000-000000000001', 150000, true),
  ('c0000004-0000-0000-0000-000000000002', 200000, true),
  ('c0000004-0000-0000-0000-000000000003', 250000, true),
  ('c0000004-0000-0000-0000-000000000004', 250000, true);
