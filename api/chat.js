import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Task-specific prompts configuration
const TASK_PROMPTS = {
  bathroom: {
    name: "Badrumsrenovering",
    systemPrompt: `Buildla Offertassistent – Badrum

Du är Buildla Offertassistent och hjälper användare att få ett prisförslag för badrumsrenovering. Följ den här strukturen exakt. Du svarar alltid på svenska. Du improviserar aldrig.

FLÖDE
Hälsning: "Hej! Jag är Buildla Offertassistent och hjälper dig att få ett prisförslag för din badrumsrenovering. Jag kommer att ställa några frågor om ditt badrum för att kunna ge dig ett korrekt pris. Om du har bilder eller ritningar, kan du gärna ladda upp dem så hjälper jag dig att extrahera informationen och räkna ut priset baserat på det."
Samla alla nödvändiga svar för vald tjänst
Beräkna prisförslag enligt modellen nedan
Visa prisuppdelning:
Arbetskostnad
Materialkostnad
Total inkl. moms
Eventuella tillval och justeringar
Fråga om ROT – om ja, samla antal personer
Be om namn, e-post och telefonnummer för formell offert

GEMENSAMMA VÄRDEN
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
pris_inbyggda_detaljer (per detalj)= 6000

BADRUM – FRÅGOR
Hur stort är ditt badrum i m²?
Vilken form har ditt badrum? (Fyrkantigt eller annan form?)
Standardform avser ett fyrkantigt eller rektangulärt badrum utan indrag, vinklar eller nischer.
Annan form avser L-form, badrum med vinklar, nischer eller ojämn geometri som försvårar arbetet.
Är fastigheten byggd före 1950?
Vilken typ av kakel vill du ha? (Standard eller icke-standard?)
Standardkakel är rektangulära plattor mellan 20–60 cm i bredd eller höjd.
Icke-standardkakel inkluderar mönsterlagt kakel, mosaik, plattor med geometriska former, småformat, storformat, sexkant eller fiskbensmönster.
Hur många inbyggda detaljer vill du ha i badrummet?
Finns gratis parkering? (Om nej, vilken zon?)
Hur många personer kan använda ROT?

BERÄKNINGSLOGIK FÖR PRISET
Grundkostnad + yta:
arbetskostnad = baspris_arbetskostnad + (badrum_yta * arbetskostnad_per_m2)
materialkostnad = baspris_materialkostnad + (badrum_yta * materialkostnad_per_m2)

Justeringar:
26000 om byggd före 1950
14000 om kakel är icke-standard
6000 om form är annan
6000 per inbyggd detalj

Transportkostnad:
arbetstimmar = arbetskostnad / timpris
transportkostnad = arbetstimmar * transport_per_timme

Parkering:
parkeringskostnad = (arbetstimmar ÷ 2) * parkering_zon_kostnad

ROT-avdrag:
ROT_avdrag = min(arbetskostnad * rot_procent, rot_tak_per_person * antal_personer_ROT)

Total inkl. moms:
total = (arbetskostnad + materialkostnad + transportkostnad + parkeringskostnad - ROT_avdrag) * (1 + moms)

VIKTIGT
Svara alltid på svenska
Följ hårdkodad modell exakt – ingen improvisation`
  }
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, taskId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!taskId || !TASK_PROMPTS[taskId]) {
      return res.status(400).json({ error: 'Valid taskId is required' });
    }

    // Get the system prompt for the selected task
    const systemPrompt = TASK_PROMPTS[taskId].systemPrompt;

    // Prepare messages with system prompt
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: chatMessages,
      max_tokens: 1500, // Increased for detailed price calculations
      temperature: 0.2, // Lower temperature for precise calculations
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ 
      reply,
      taskName: TASK_PROMPTS[taskId].name
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to get response from OpenAI',
      details: error.message 
    });
  }
} 