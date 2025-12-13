-- Insert sample skincare products
INSERT INTO products (name, slug, description, short_description, price, compare_at_price, category, ingredients, benefits, how_to_use, image_url, additional_images, stock_quantity, is_featured, is_bestseller) VALUES
(
  'Hydrating Facial Cleanser',
  'hydrating-facial-cleanser',
  'A gentle, pH-balanced cleanser that effectively removes impurities while maintaining your skin''s natural moisture barrier. Formulated with hyaluronic acid and ceramides, it leaves skin feeling clean, soft, and hydrated.',
  'Gentle cleanser that hydrates while it cleanses',
  28.00,
  35.00,
  'Cleansers',
  ARRAY['Water', 'Glycerin', 'Sodium Hyaluronate', 'Ceramide NP', 'Niacinamide', 'Panthenol'],
  ARRAY['Gently cleanses without stripping', 'Maintains moisture barrier', 'Suitable for all skin types', 'Non-comedogenic'],
  'Apply to damp skin morning and evening. Massage gently in circular motions, then rinse thoroughly with lukewarm water.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  150,
  true,
  true
),
(
  'Vitamin C Brightening Serum',
  'vitamin-c-brightening-serum',
  'A potent antioxidant serum featuring 15% L-Ascorbic Acid to brighten, firm, and protect your skin. Enhanced with vitamin E and ferulic acid for maximum stability and effectiveness. Helps reduce the appearance of fine lines, dark spots, and uneven skin tone.',
  'Powerful brightening serum with 15% Vitamin C',
  68.00,
  85.00,
  'Serums',
  ARRAY['L-Ascorbic Acid 15%', 'Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid'],
  ARRAY['Brightens skin tone', 'Reduces dark spots', 'Antioxidant protection', 'Improves firmness'],
  'Apply 3-5 drops to clean, dry skin in the morning. Follow with moisturizer and SPF.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  200,
  true,
  true
),
(
  'Niacinamide Pore Refining Toner',
  'niacinamide-pore-refining-toner',
  'A lightweight, alcohol-free toner enriched with 5% niacinamide to minimize the appearance of pores, control excess oil, and improve skin texture. Zinc PCA helps balance sebum production while hyaluronic acid provides hydration.',
  'Balances and refines with 5% Niacinamide',
  32.00,
  NULL,
  'Toners',
  ARRAY['Niacinamide 5%', 'Zinc PCA', 'Hyaluronic Acid', 'Witch Hazel Extract'],
  ARRAY['Minimizes pores', 'Controls oil production', 'Improves skin texture', 'Alcohol-free formula'],
  'After cleansing, apply to a cotton pad or palm and gently pat onto face and neck. Use morning and evening.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  180,
  false,
  true
),
(
  'Retinol Renewal Night Cream',
  'retinol-renewal-night-cream',
  'An advanced anti-aging night cream featuring encapsulated retinol for time-released delivery. Works overnight to reduce fine lines, improve skin texture, and promote cell renewal. Enriched with peptides and squalane to nourish and support skin barrier function.',
  'Anti-aging night cream with encapsulated retinol',
  75.00,
  95.00,
  'Moisturizers',
  ARRAY['Retinol 0.5%', 'Peptide Complex', 'Squalane', 'Ceramides', 'Niacinamide'],
  ARRAY['Reduces fine lines', 'Improves texture', 'Promotes cell renewal', 'Time-released formula'],
  'Apply a pea-sized amount to clean, dry skin at night. Start with 2-3 times per week and gradually increase. Always use SPF during the day.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  120,
  true,
  false
),
(
  'Hyaluronic Acid Hydrating Serum',
  'hyaluronic-acid-hydrating-serum',
  'A multi-weight hyaluronic acid serum that delivers intense hydration to all layers of the skin. Features three molecular weights of hyaluronic acid for immediate and long-lasting moisture. Plumps fine lines and leaves skin supple and dewy.',
  'Triple-weight hyaluronic acid for deep hydration',
  48.00,
  NULL,
  'Serums',
  ARRAY['Hyaluronic Acid (Low, Medium, High MW)', 'Glycerin', 'B5 Panthenol', 'Allantoin'],
  ARRAY['Intense hydration', 'Plumps fine lines', 'Suitable for all skin types', 'Lightweight formula'],
  'Apply 3-5 drops to damp skin morning and evening. Follow with moisturizer to seal in hydration.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  220,
  false,
  true
),
(
  'SPF 50 Mineral Sunscreen',
  'spf-50-mineral-sunscreen',
  'A lightweight, broad-spectrum mineral sunscreen that provides superior UVA/UVB protection without leaving a white cast. Formulated with zinc oxide and titanium dioxide, plus antioxidants to protect against environmental damage. Perfect for daily use under makeup.',
  'Invisible mineral sunscreen with SPF 50',
  38.00,
  45.00,
  'Sunscreen',
  ARRAY['Zinc Oxide 12%', 'Titanium Dioxide 6%', 'Vitamin E', 'Green Tea Extract', 'Niacinamide'],
  ARRAY['Broad spectrum SPF 50', 'No white cast', 'Reef-safe formula', 'Antioxidant protection'],
  'Apply liberally 15 minutes before sun exposure. Reapply every 2 hours or after swimming/sweating.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  300,
  true,
  false
),
(
  'Gentle Exfoliating AHA/BHA Serum',
  'gentle-exfoliating-aha-bha-serum',
  'A perfectly balanced chemical exfoliant featuring 10% glycolic acid (AHA) and 2% salicylic acid (BHA). Gently removes dead skin cells, unclogs pores, and reveals smoother, more radiant skin. Enhanced with soothing aloe and green tea extract.',
  'Dual-action exfoliant for smooth, clear skin',
  52.00,
  NULL,
  'Serums',
  ARRAY['Glycolic Acid 10%', 'Salicylic Acid 2%', 'Aloe Vera', 'Green Tea Extract', 'Allantoin'],
  ARRAY['Exfoliates dead skin', 'Unclogs pores', 'Improves texture', 'Promotes radiance'],
  'Apply 2-3 times per week in the evening to clean, dry skin. Avoid eye area. Follow with moisturizer and use SPF during the day.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  160,
  false,
  false
),
(
  'Ceramide Barrier Repair Cream',
  'ceramide-barrier-repair-cream',
  'A rich, nourishing moisturizer formulated with a triple ceramide complex to strengthen and repair the skin barrier. Perfect for dry, sensitive, or compromised skin. Provides long-lasting hydration without feeling heavy or greasy.',
  'Intensive barrier repair with ceramides',
  58.00,
  NULL,
  'Moisturizers',
  ARRAY['Ceramide NP, AP, EOP', 'Cholesterol', 'Fatty Acids', 'Niacinamide', 'Hyaluronic Acid'],
  ARRAY['Repairs skin barrier', 'Long-lasting hydration', 'Reduces sensitivity', 'Non-greasy formula'],
  'Apply morning and evening to clean skin. Can be used all over face and neck, or as a targeted treatment for dry areas.',
  '/placeholder.svg?height=600&width=600',
  ARRAY[
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600'
  ],
  140,
  false,
  true
);
