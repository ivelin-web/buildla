-- Model Settings Migration
-- Add this to your Supabase SQL editor

CREATE TABLE IF NOT EXISTS model_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model varchar(50) NOT NULL DEFAULT 'gpt-4.1-nano',
  temperature decimal(3,2) NOT NULL DEFAULT 0.20 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens integer NOT NULL DEFAULT 2048 CHECK (max_tokens >= 100 AND max_tokens <= 32768),
  top_p decimal(3,2) NOT NULL DEFAULT 1.00 CHECK (top_p >= 0 AND top_p <= 1),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings
INSERT INTO model_settings (model, temperature, max_tokens, top_p) 
VALUES ('gpt-4.1-nano', 0.20, 2048, 1.00)
ON CONFLICT DO NOTHING;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_model_settings_updated_at 
    BEFORE UPDATE ON model_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();