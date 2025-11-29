-- Migration to change from single image_url to images_urls array

-- Add the new images_urls column
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS images_urls TEXT[];

-- Migrate existing data from image_url to images_urls
-- Note: image_url column may not exist if migration was already run
-- UPDATE prescriptions
-- SET images_urls = ARRAY[image_url]
-- WHERE image_url IS NOT NULL AND (images_urls IS NULL OR array_length(images_urls, 1) IS NULL);

-- Update the get_nearby_prescriptions function to return images_urls instead of image_url
CREATE OR REPLACE FUNCTION get_nearby_prescriptions(
  pharmacy_lat DOUBLE PRECISION,
  pharmacy_lng DOUBLE PRECISION,
  max_distance INTEGER DEFAULT 50000
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  images_urls TEXT[],
  notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  user_latitude DOUBLE PRECISION,
  user_longitude DOUBLE PRECISION,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.images_urls,
    p.notes,
    p.status,
    p.created_at,
    p.user_latitude,
    p.user_longitude,
    ST_Distance(
      ST_MakePoint(p.user_longitude, p.user_latitude)::geography,
      ST_MakePoint(pharmacy_lng, pharmacy_lat)::geography
    ) as distance
  FROM prescriptions p
  WHERE p.user_latitude IS NOT NULL
    AND p.user_longitude IS NOT NULL
    AND p.images_urls IS NOT NULL
    AND array_length(p.images_urls, 1) > 0
    AND ST_Distance(
      ST_MakePoint(p.user_longitude, p.user_latitude)::geography,
      ST_MakePoint(pharmacy_lng, pharmacy_lat)::geography
    ) <= max_distance
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comment to the new column
COMMENT ON COLUMN prescriptions.images_urls IS 'Array of prescription image URLs';

-- Optional: Drop the old column after migration (uncomment if you want to remove it)
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS image_url;
