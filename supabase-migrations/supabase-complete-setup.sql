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

PRISBERÄKNINGSMETOD:
KRITISKT: För 100% noggrannhet, ALLTID genomför fullständig steg-för-steg beräkning internt innan du visar resultatet.
- Beräkna ALLTID alla steg: baskostnad, m2-kostnad, tillägg, arbetstimmar, transport, parkering, ROT-avdrag
- Visa ENDAST den slutliga rena prisuppdelningen till kunden
- Visa ALDRIG mellansteg som "(70 000 kr + (3,2 m² × 16 000 kr) = 121 200 kr)" såvida inte kunden specifikt ber om det
- Presentera resultatet som: "Arbetskostnad: 133 200 kr" istället för beräkningsstegen
- Behåll intern noggrannhet men visa ren, professionell utmatning
- ALDRIG säg "Nu ska jag räkna", "Vänta medan jag beräknar", "Låt mig räkna ut detta" eller liknande - visa bara resultatet direkt

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

-- ================================================================
-- SETUP COMPLETE
-- ================================================================
-- Your Buildla database is now ready with:
-- ✅ Assistants table with Swedish bathroom renovation assistant
-- ✅ Model settings table with optimal AI configuration
-- ✅ Offers table for customer quote management
-- ✅ All indexes, triggers, and RLS policies
-- ✅ Default Swedish market pricing and conversation flow
-- 
-- Next steps:
-- 1. Configure your environment variables in .env.local
-- 2. Test the chat widget with the Swedish assistant
-- 3. Use the helper scripts to switch languages if needed
-- ================================================================