-- Function to get prescriptions within specified distance
CREATE OR REPLACE FUNCTION get_nearby_prescriptions(
  pharmacy_lat DOUBLE PRECISION,
  pharmacy_lng DOUBLE PRECISION,
  max_distance INTEGER DEFAULT 50000
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  image_url TEXT,
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
    p.image_url,
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
    AND ST_Distance(
      ST_MakePoint(p.user_longitude, p.user_latitude)::geography,
      ST_MakePoint(pharmacy_lng, pharmacy_lat)::geography
    ) <= max_distance
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
