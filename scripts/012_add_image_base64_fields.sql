-- Add image_url field to prescriptions if it doesn't exist
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update subscriptions to use receipt_url for base64
-- Already exists, no change needed

-- Add comment
COMMENT ON COLUMN prescriptions.image_url IS 'Base64 encoded prescription image or storage URL';
COMMENT ON COLUMN subscriptions.receipt_url IS 'Base64 encoded receipt image or storage URL';
