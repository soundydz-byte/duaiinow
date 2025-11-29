-- Add archiving system for prescriptions
-- This system automatically archives prescriptions after 60 minutes
-- and allows retrieval for 30 days

-- Add archived_at column to prescriptions table
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add archive_reason column to track why it was archived
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS archive_reason TEXT DEFAULT 'auto_archived';

-- Create archived_prescriptions table for better organization
CREATE TABLE IF NOT EXISTS archived_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL, -- Reference to original prescription
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Store complete prescription data
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by UUID REFERENCES auth.users(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_archived_at ON prescriptions(archived_at);
CREATE INDEX IF NOT EXISTS idx_archived_prescriptions_user_id ON archived_prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_archived_prescriptions_expires_at ON archived_prescriptions(expires_at);

-- Function to automatically archive prescriptions after 60 minutes
CREATE OR REPLACE FUNCTION archive_expired_prescriptions()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER := 0;
  prescription_record RECORD;
BEGIN
  -- Archive prescriptions older than 60 minutes that haven't been responded to
  FOR prescription_record IN
    SELECT p.* FROM prescriptions p
    WHERE p.created_at < (NOW() - INTERVAL '60 minutes')
    AND p.archived_at IS NULL
    AND p.status = 'pending'
  LOOP
    -- Insert into archived table
    INSERT INTO archived_prescriptions (original_id, user_id, data)
    VALUES (
      prescription_record.id,
      prescription_record.user_id,
      row_to_json(prescription_record)
    );

    -- Mark as archived in original table
    UPDATE prescriptions
    SET archived_at = NOW(), archive_reason = 'auto_archived'
    WHERE id = prescription_record.id;

    archived_count := archived_count + 1;
  END LOOP;

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired archived prescriptions (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_expired_archives()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM archived_prescriptions
  WHERE expires_at < NOW()
  AND restored_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to restore archived prescription
CREATE OR REPLACE FUNCTION restore_archived_prescription(
  archive_id UUID,
  restorer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  archive_data JSONB;
  prescription_id UUID;
BEGIN
  -- Get archived data
  SELECT data INTO archive_data
  FROM archived_prescriptions
  WHERE id = archive_id
  AND expires_at > NOW()
  AND restored_at IS NULL;

  IF archive_data IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Insert back into prescriptions table
  INSERT INTO prescriptions (
    id, user_id, notes, status, created_at, updated_at,
    user_latitude, user_longitude, images_urls
  )
  SELECT
    (archive_data->>'id')::UUID,
    (archive_data->>'user_id')::UUID,
    archive_data->>'notes',
    'restored'::prescription_status,
    (archive_data->>'created_at')::TIMESTAMP WITH TIME ZONE,
    NOW(),
    (archive_data->>'user_latitude')::DECIMAL,
    (archive_data->>'user_longitude')::DECIMAL,
    CASE
      WHEN archive_data->'images_urls' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(archive_data->'images_urls'))
      ELSE NULL
    END
  ON CONFLICT (id) DO NOTHING;

  -- Mark as restored
  UPDATE archived_prescriptions
  SET restored_at = NOW(), restored_by = restorer_id
  WHERE id = archive_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create notification function for archive warnings
CREATE OR REPLACE FUNCTION notify_prescription_archive_warning()
RETURNS TRIGGER AS $$
DECLARE
  time_until_archive INTERVAL;
  user_id UUID;
BEGIN
  -- Calculate time until archive (60 minutes from creation)
  time_until_archive := INTERVAL '60 minutes' - (NOW() - NEW.created_at);

  -- If less than 10 minutes until archive, send warning
  IF time_until_archive <= INTERVAL '10 minutes' AND time_until_archive > INTERVAL '0 minutes' THEN
    -- Get user_id from prescription
    SELECT NEW.user_id INTO user_id;

    -- Insert notification
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (
      user_id,
      'تنبيه: وصفتك الطبية ستنتقل للأرشيف قريباً',
      'ستنتقل وصفتك الطبية للأرشيف خلال ' || EXTRACT(MINUTES FROM time_until_archive) || ' دقيقة. يمكنك استرجاعها لاحقاً من قسم الأرشيف.',
      'prescription_warning',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for archive warnings
DROP TRIGGER IF EXISTS notify_prescription_archive_warning_trigger ON prescriptions;
CREATE TRIGGER notify_prescription_archive_warning_trigger
  AFTER INSERT OR UPDATE OF created_at ON prescriptions
  FOR EACH ROW
  WHEN (NEW.status = 'pending' AND NEW.archived_at IS NULL)
  EXECUTE FUNCTION notify_prescription_archive_warning();

-- RLS Policies for archived_prescriptions
ALTER TABLE archived_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own archived prescriptions"
ON archived_prescriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can restore their own archived prescriptions"
ON archived_prescriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE archived_prescriptions IS 'Archived prescriptions that can be restored within 30 days';
COMMENT ON COLUMN prescriptions.archived_at IS 'Timestamp when prescription was archived';
COMMENT ON COLUMN prescriptions.archive_reason IS 'Reason for archiving (auto_archived, manual, etc.)';

-- Schedule the archiving function to run every 5 minutes
-- Note: This would typically be done via a cron job or scheduled task in production
-- For development, we can call it manually or set up a simple scheduler

-- Example of how to call the functions:
-- SELECT archive_expired_prescriptions(); -- Archive old prescriptions
-- SELECT cleanup_expired_archives(); -- Clean up expired archives
