-- Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    assistant_id uuid REFERENCES public.assistants(id),
    customer_info jsonb NOT NULL,
    offer_details jsonb NOT NULL,
    chat_messages jsonb,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS offers_assistant_id_idx ON public.offers(assistant_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON public.offers(status);
CREATE INDEX IF NOT EXISTS offers_created_at_idx ON public.offers(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now
-- You can modify this based on your authentication requirements
CREATE POLICY "Allow all operations on offers" ON public.offers
    FOR ALL USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();