-- ================================================================
-- BUILDLA - COMPLETE SUPABASE DATABASE SETUP
-- ================================================================
-- This script sets up the complete Buildla database schema with all necessary
-- tables, indexes, triggers, and default data for Swedish market operation.
-- 
-- Run this script in your Supabase SQL Editor to set up everything at once.
-- ================================================================

-- ================================================================
-- 1. HELPER FUNCTIONS AND TRIGGERS
-- ================================================================

-- Create updated_at trigger function (used by multiple tables)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Alternative trigger function for model_settings table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ================================================================
-- 2. ASSISTANTS TABLE
-- ================================================================

-- Create assistants table
CREATE TABLE IF NOT EXISTS public.assistants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    system_prompt text NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS assistants_created_at_idx ON public.assistants(created_at DESC);
CREATE INDEX IF NOT EXISTS assistants_name_idx ON public.assistants(name);
CREATE INDEX IF NOT EXISTS assistants_category_idx ON public.assistants(category);

-- Set up Row Level Security (RLS)
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now
-- You can modify this based on your authentication requirements
CREATE POLICY "Allow all operations on assistants" ON public.assistants
    FOR ALL USING (true);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS handle_assistants_updated_at ON public.assistants;
CREATE TRIGGER handle_assistants_updated_at
    BEFORE UPDATE ON public.assistants
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- ================================================================
-- 3. MODEL SETTINGS TABLE
-- ================================================================

-- Create model settings table
CREATE TABLE IF NOT EXISTS model_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model varchar(50) NOT NULL DEFAULT 'gpt-4.1-nano',
  temperature decimal(3,2) NOT NULL DEFAULT 0.20 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens integer NOT NULL DEFAULT 2048 CHECK (max_tokens >= 100 AND max_tokens <= 32768),
  top_p decimal(3,2) NOT NULL DEFAULT 1.00 CHECK (top_p >= 0 AND top_p <= 1),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create update trigger for updated_at
DROP TRIGGER IF EXISTS update_model_settings_updated_at ON model_settings;
CREATE TRIGGER update_model_settings_updated_at 
    BEFORE UPDATE ON model_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 4. OFFERS TABLE
-- ================================================================

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
DROP TRIGGER IF EXISTS handle_offers_updated_at ON public.offers;
CREATE TRIGGER handle_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- ================================================================
-- 5. DEFAULT DATA - SWEDISH MARKET CONFIGURATION
-- ================================================================

-- Insert default model settings optimized for Swedish market
INSERT INTO model_settings (model, temperature, max_tokens, top_p) 
VALUES ('gpt-4.1-nano', 0.20, 2048, 1.00)
ON CONFLICT DO NOTHING;

-- Insert Swedish bathroom renovation assistant with natural conversation flow
INSERT INTO public.assistants (name, description, system_prompt, category) VALUES (
    'Badrumsrenovering',
    'Få prisförslag för din badrumsrenovering',
    'Du är en hjälpsam badrumsrenoveringsassistent för Buildla. Ditt mål är att samla information för en offert på ett naturligt, konversationellt sätt.

INFORMATION DU BEHÖVER SAMLA:
1. Badrumssstorlek (i kvadratmeter)
2. Badrumsform (standard/fyrkantigt vs annat/komplex form)
3. Fastighetens ålder (byggd före 1950 eller efter)
4. Kakelval (standard vs icke-standard/specialkakel)
5. Antal inbyggda detaljer (antal specialfunktioner)
6. Parkeringsituation (gratis vs betalzoner 1-5)
7. ROT-avdragsbehörighet (antal personer)
8. Kontaktinformation (fullständigt namn, e-postadress och telefonnummer)

KONVERSATIONSRIKTLINJER:
- Var vänlig och konversationell, inte robotisk
- Ställ frågor naturligt - använd inte exakta skriptade fraser
- Om svaren är oklara, ställ uppföljningsfrågor artigt
- Förklara varför du behöver information när det är hjälpsamt
- Visa entusiasm och expertis om badrumsrenoveringar
- Få användaren att känna sig bekväm och förstådd

PROCESSFLÖDE:
1. När användaren hälsar (som "Hej" eller "Hallo"), svara med vänlig introduktion och börja omedelbart samla information
2. Samla badrumsinformation konversationellt
3. När du har alla badrumsdetaljer, beräkna och visa komplett prisuppdelning
4. Efter att ha visat priser, fråga efter kontaktinformation - var specifik att du behöver fullständigt namn, e-postadress och telefonnummer (inte vaga termer som "kontaktuppgifter")
5. Anropa saveOffer-funktionen med all data när du har allt
6. Tacka användaren och bekräfta att deras offert är sparad

HÄLSNINGSSVAR:
När användaren säger "Hej", "Hallo" eller liknande hälsning, svara naturligt med något som:
"Hej! Jag hjälper dig att få en offert för din badrumsrenovering. Låt mig fråga om ditt projekt - hur stort är ditt badrum i kvadratmeter?"

VIKTIGA TEKNISKA KRAV:
- Svara alltid på svenska
- Få giltiga svar för alla 7 informationspunkter innan du beräknar priser
- Visa komplett prisuppdelning innan du samlar kontakter
- KRITISKT: När du samlar kontaktinfo, var specifik om att du behöver fullständigt namn, e-postadress och telefonnummer - Använd ALDRIG vaga termer som "kontaktuppgifter"
- Anropa saveOffer-funktionen omedelbart efter att ha fått fullständigt namn, e-postadress och telefonnummer
- Efter sparande, tacka kunden och bekräfta att deras offert har sparats framgångsrikt och att de kommer höra från Buildla snart

PRISVÄRDEN
baspris_arbetskostnad = 70000
baspris_materialkostnad = 30000
arbetskostnad_per_m2 = 16000
materialkostnad_per_m2 = 4000
timpris = 650
moms = 0.25
transport_per_timme = 14
rot_procent = 0.5
rot_tak_per_person = 50000
parkering_zoner = Zon 1: 50, Zon 2: 25, Zon 3: 20, Zon 4: 10, Zon 5: 5
pris_bostad_fore_1950 = 26000
pris_icke_standard_kakel = 14000
pris_icke_standard_form = 6000
pris_inbyggda_detaljer_per_styck = 6000

PRISBERÄKNINGSLOGIK
Grundkostnad + yta:
arbetskostnad = baspris_arbetskostnad + (badrum_yta * arbetskostnad_per_m2)
materialkostnad = baspris_materialkostnad + (badrum_yta * materialkostnad_per_m2)

Justeringar:
+26000 om byggd före 1950
+14000 om icke-standard kakel
+6000 om icke-standard form
+6000 per inbyggd detalj

Transportkostnad:
arbetstimmar = arbetskostnad / timpris
transportkostnad = arbetstimmar * transport_per_timme

Parkeringskostnad:
parkeringskostnad = (arbetstimmar ÷ 2) * parkering_zon_kostnad

ROT-avdrag:
ROT_avdrag = min(arbetskostnad * rot_procent, rot_tak_per_person * antal_personer_ROT)

Total inkl. moms:
total = (arbetskostnad + materialkostnad + transportkostnad + parkeringskostnad - ROT_avdrag) * (1 + moms)',
    'Renovation'
) ON CONFLICT DO NOTHING;

-- Insert Swedish FAQ assistant with automatic search functionality
INSERT INTO public.assistants (name, description, system_prompt, category) VALUES (
    'FAQ Byggguide',
    'Få svar på frågor om träbyggande och träkonstruktioner',
    'Du är en specialist inom träbyggande för Buildla. Din expertis kommer från TräGuiden.se som fokuserar specifikt på träbyggande och träkonstruktioner.

MIN SPECIALITET:
Jag hjälper med frågor om:
- Träbyggande och träkonstruktioner (trä som byggmaterial, limträ, KL-trä/CLT)
- Dimensionering och beräkningar för träkonstruktioner
- Fukt, brand och ljudisolering i träbyggnader
- Ytbehandling och underhåll av träkonstruktioner
- Miljöaspekter av träbyggande

STRIKTA REGLER:
1. ANVÄND ENDAST information från searchFAQ-verktygets resultat
2. LÄGG ALDRIG TILL egen kunskap utöver sökresultaten
3. Om searchFAQ returnerar 0 resultat: Erkänn ärligt att du inte har information och förklara din specialitet
4. För frågor utanför träbyggande: Förklara vänligt din specialitet och hänvisa till lämplig expert

HUR JAG ARBETAR:
1. För hälsningar (som "Hej", "Hello", "Halla"): Svara direkt utan att använda searchFAQ
2. För faktiska frågor om trä/byggande: Använd searchFAQ först
3. Citera ENDAST från sökresultaten
4. Inkludera alltid källhänvisning: "Källa: [URL från traguiden.se]"
5. Var ärlig när information saknas

TONFALL:
- Var naturlig och hjälpsam
- Använd ditt eget omdöme för att formulera svar
- Håll fokus på din specialitet inom träbyggande
- Var ärlig och transparent när du inte kan hjälpa',
    'FAQ'
) ON CONFLICT DO NOTHING;

-- ================================================================
-- 6. FAQ EMBEDDINGS TABLE AND SEARCH FUNCTION
-- ================================================================

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create FAQ embeddings table for semantic search
CREATE TABLE IF NOT EXISTS public.faq_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1536),  -- text-embedding-3-small dimensions
    url TEXT NOT NULL,
    title TEXT,
    source_website TEXT,  -- Track which website content came from
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR FAQ PERFORMANCE
-- ================================================================

-- HNSW index for fast vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS faq_embeddings_embedding_idx 
ON public.faq_embeddings USING hnsw (embedding vector_cosine_ops);

-- URL index for deduplication and lookups
CREATE INDEX IF NOT EXISTS faq_embeddings_url_idx 
ON public.faq_embeddings(url);

-- Created date index for maintenance queries
CREATE INDEX IF NOT EXISTS faq_embeddings_created_at_idx 
ON public.faq_embeddings(created_at DESC);

-- Source website index for filtering by source
CREATE INDEX IF NOT EXISTS faq_embeddings_source_website_idx 
ON public.faq_embeddings(source_website);

-- Add content hash column for efficient duplicate prevention
ALTER TABLE public.faq_embeddings 
ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Create unique constraint on url and content hash (avoids PostgreSQL index size limits)
ALTER TABLE public.faq_embeddings 
ADD CONSTRAINT faq_embeddings_url_hash_unique 
UNIQUE (url, content_hash);

-- ================================================================
-- FAQ SEARCH FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION search_faq_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  content text,
  title text,
  url text,
  similarity float,
  source_website text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    faq_embeddings.content,
    faq_embeddings.title,
    faq_embeddings.url,
    1 - (faq_embeddings.embedding <=> query_embedding) AS similarity,
    faq_embeddings.source_website
  FROM faq_embeddings
  WHERE 1 - (faq_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY faq_embeddings.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;

-- ================================================================
-- FAQ TABLE COMMENTS
-- ================================================================

COMMENT ON TABLE public.faq_embeddings IS 'Stores website content chunks with vector embeddings for FAQ semantic search';
COMMENT ON COLUMN public.faq_embeddings.content IS 'Text chunk from scraped website content';
COMMENT ON COLUMN public.faq_embeddings.embedding IS 'Vector embedding generated by OpenAI text-embedding-3-small';
COMMENT ON COLUMN public.faq_embeddings.url IS 'Source URL where this content was scraped from';
COMMENT ON COLUMN public.faq_embeddings.title IS 'Page title or section title';
COMMENT ON COLUMN public.faq_embeddings.source_website IS 'Source website domain (e.g., traguiden.se)';
COMMENT ON FUNCTION search_faq_embeddings IS 'Performs semantic search on FAQ embeddings using cosine similarity';
COMMENT ON CONSTRAINT faq_embeddings_url_hash_unique ON public.faq_embeddings 
IS 'Prevents duplicate content from same URL - ensures scraper can run multiple times safely';

-- ================================================================
-- SETUP COMPLETE
-- ================================================================
-- Your Buildla database is now ready with:
-- ✅ Assistants table with Swedish bathroom renovation and FAQ assistants
-- ✅ Model settings table with optimal AI configuration
-- ✅ Offers table for customer quote management
-- ✅ FAQ embeddings table with vector search capability and duplicate prevention
-- ✅ All indexes, triggers, and RLS policies
-- ✅ Default Swedish market pricing and conversation flow
-- ✅ pgvector extension and semantic search function
-- 
-- Next steps:
-- 1. Configure your environment variables in .env.local
-- 2. Run the FAQ scraper to populate embeddings: node scripts/faq-scraper.js --site=traguiden.se
-- 3. Test the chat widget with FAQ search capability
-- 4. Use the helper scripts to switch languages if needed
-- ================================================================