-- Add first_message column to assistants table
-- This column stores the initial greeting message that will be auto-sent when an assistant is selected

ALTER TABLE public.assistants 
ADD COLUMN IF NOT EXISTS first_message text NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.assistants.first_message IS 'Optional greeting message automatically sent when assistant is selected';

-- Update existing bathroom renovation assistant (English) with natural greeting
UPDATE public.assistants 
SET first_message = 'Hi! I''m here to help you get a bathroom renovation quote. Let''s start by learning about your project!'
WHERE name = 'Badrumsrenovering' 
  AND system_prompt LIKE '%You always answer in English%';

-- Update existing bathroom renovation assistant (Swedish) with natural greeting
UPDATE public.assistants 
SET first_message = 'Hej! Jag hjälper dig att få en offert för din badrumsrenovering. Låt oss börja!'
WHERE name = 'Badrumsrenovering' 
  AND system_prompt LIKE '%Du svarar alltid på svenska%';