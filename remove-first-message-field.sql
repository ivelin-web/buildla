-- Remove first_message column from assistants table since we're using auto-start approach
ALTER TABLE public.assistants 
DROP COLUMN IF EXISTS first_message;