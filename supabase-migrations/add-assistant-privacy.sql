-- Add is_public field to assistants table
-- New assistants will be private by default
ALTER TABLE public.assistants
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering public assistants
CREATE INDEX IF NOT EXISTS assistants_is_public_idx ON public.assistants(is_public);

-- Make existing assistants public to maintain current behavior
UPDATE public.assistants SET is_public = TRUE WHERE is_public IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.assistants.is_public IS 'Whether this assistant is publicly available in the widget (default: false)';