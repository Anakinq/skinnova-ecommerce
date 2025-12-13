-- Update all product prices from USD to Nigerian Naira (NGN)
-- Using approximate exchange rate of 1 USD = 1600 NGN

UPDATE products SET
  price = CASE slug
    WHEN 'hydrating-facial-cleanser' THEN 44800.00
    WHEN 'vitamin-c-brightening-serum' THEN 108800.00
    WHEN 'niacinamide-pore-refining-toner' THEN 51200.00
    WHEN 'retinol-renewal-night-cream' THEN 120000.00
    WHEN 'hyaluronic-acid-hydrating-serum' THEN 76800.00
    WHEN 'spf-50-mineral-sunscreen' THEN 60800.00
    WHEN 'gentle-exfoliating-aha-bha-serum' THEN 83200.00
    WHEN 'ceramide-barrier-repair-cream' THEN 92800.00
  END,
  compare_at_price = CASE slug
    WHEN 'hydrating-facial-cleanser' THEN 56000.00
    WHEN 'vitamin-c-brightening-serum' THEN 136000.00
    WHEN 'niacinamide-pore-refining-toner' THEN NULL
    WHEN 'retinol-renewal-night-cream' THEN 152000.00
    WHEN 'hyaluronic-acid-hydrating-serum' THEN NULL
    WHEN 'spf-50-mineral-sunscreen' THEN 72000.00
    WHEN 'gentle-exfoliating-aha-bha-serum' THEN NULL
    WHEN 'ceramide-barrier-repair-cream' THEN NULL
  END
WHERE slug IN (
  'hydrating-facial-cleanser',
  'vitamin-c-brightening-serum',
  'niacinamide-pore-refining-toner',
  'retinol-renewal-night-cream',
  'hyaluronic-acid-hydrating-serum',
  'spf-50-mineral-sunscreen',
  'gentle-exfoliating-aha-bha-serum',
  'ceramide-barrier-repair-cream'
);
