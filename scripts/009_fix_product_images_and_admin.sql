-- Update all product images to use real image paths
UPDATE products SET 
  image_url = '/images/gentle-cleanser.jpg',
  additional_images = ARRAY['/images/gentle-cleanser.jpg', '/images/gentle-cleanser-2.jpg']
WHERE slug = 'hydrating-facial-cleanser';

UPDATE products SET 
  image_url = '/images/vitamin-c-serum.jpg',
  additional_images = ARRAY['/images/vitamin-c-serum.jpg', '/images/vitamin-c-serum-2.jpg']
WHERE slug = 'vitamin-c-brightening-serum';

UPDATE products SET 
  image_url = '/images/exfoliating-toner.jpg',
  additional_images = ARRAY['/images/exfoliating-toner.jpg', '/images/exfoliating-toner-2.jpg']
WHERE slug = 'niacinamide-pore-refining-toner';

UPDATE products SET 
  image_url = '/images/retinol-night-cream.jpg',
  additional_images = ARRAY['/images/retinol-night-cream.jpg', '/images/retinol-night-cream-2.jpg']
WHERE slug = 'retinol-renewal-night-cream';

UPDATE products SET 
  image_url = '/images/hydrating-serum.jpg',
  additional_images = ARRAY['/images/hydrating-serum.jpg', '/images/hydrating-serum-2.jpg']
WHERE slug = 'hyaluronic-acid-hydrating-serum';

UPDATE products SET 
  image_url = '/images/sunscreen-spf50.jpg',
  additional_images = ARRAY['/images/sunscreen-spf50.jpg', '/images/sunscreen-spf50-2.jpg']
WHERE slug = 'spf-50-mineral-sunscreen';

UPDATE products SET 
  image_url = '/images/exfoliating-serum.jpg',
  additional_images = ARRAY['/images/exfoliating-serum.jpg', '/images/exfoliating-serum-2.jpg']
WHERE slug = 'gentle-exfoliating-aha-bha-serum';

UPDATE products SET 
  image_url = '/images/barrier-cream.jpg',
  additional_images = ARRAY['/images/barrier-cream.jpg', '/images/barrier-cream-2.jpg']
WHERE slug = 'ceramide-barrier-repair-cream';
