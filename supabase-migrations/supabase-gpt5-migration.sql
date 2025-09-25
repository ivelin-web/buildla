-- ================================================================
-- BUILDLA - GPT-5 MIGRATION
-- ================================================================
-- This script migrates the model_settings table from GPT-4.1 to GPT-5
-- and updates parameters according to GPT-5 requirements.
--
-- Changes:
-- - Remove: temperature, top_p (not supported by GPT-5)
-- - Add: verbosity (low/medium/high), reasoning_effort (minimal/low/medium/high)
-- - Update: model column to support GPT-5 family
-- ================================================================

-- Create enums for new GPT-5 parameters
CREATE TYPE verbosity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE reasoning_effort_level AS ENUM ('minimal', 'low', 'medium', 'high');

-- Remove old parameters and add new GPT-5 parameters
ALTER TABLE model_settings
  DROP COLUMN IF EXISTS temperature,
  DROP COLUMN IF EXISTS top_p,
  ADD COLUMN verbosity verbosity_level NOT NULL DEFAULT 'low',
  ADD COLUMN reasoning_effort reasoning_effort_level NOT NULL DEFAULT 'low';

-- Update the model column to use GPT-5 family as default
ALTER TABLE model_settings
  ALTER COLUMN model SET DEFAULT 'gpt-5-nano';

-- Update existing records to use GPT-5 models if any exist
UPDATE model_settings
SET model = CASE
  WHEN model = 'gpt-4.1' THEN 'gpt-5'
  WHEN model = 'gpt-4.1-mini' THEN 'gpt-5-mini'
  WHEN model = 'gpt-4.1-nano' THEN 'gpt-5-nano'
  ELSE 'gpt-5-nano'
END;

-- Insert default GPT-5 settings if no records exist
INSERT INTO model_settings (model, max_tokens, verbosity, reasoning_effort)
SELECT 'gpt-5-nano', 3000, 'low', 'low'
WHERE NOT EXISTS (SELECT 1 FROM model_settings);

-- Add comments for documentation
COMMENT ON COLUMN model_settings.verbosity IS 'Controls response length: low (concise), medium (balanced), high (comprehensive)';
COMMENT ON COLUMN model_settings.reasoning_effort IS 'Controls reasoning depth: minimal (fastest), low, medium, high (most thorough)';
COMMENT ON COLUMN model_settings.model IS 'GPT-5 model variant: gpt-5, gpt-5-mini, gpt-5-nano';