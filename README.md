# Buildla AI Assistant

A Next.js platform that enables businesses to create intelligent AI assistants for their Squarespace websites, with specialized focus on construction and renovation services.

## Features

- 🤖 **AI Assistant Management** - Create, edit, and delete custom AI assistants with OpenAI
- 💰 **Automated Quote Generation** - Specialized bathroom renovation pricing with Swedish market logic
- 📊 **Dashboard** - Comprehensive management interface with statistics and performance monitoring
- 🎨 **Modern UI** - Built with Next.js 15, Tailwind CSS 4, and Radix UI components
- 🔗 **Embeddable Chat Widget** - Easy integration code for external websites
- 🇸🇪 **Swedish Market Focus** - ROT tax deduction calculations and local pricing
- 🔍 **Semantic FAQ Search** - AI-powered FAQ system with vector embeddings and source citations
- 🕷️ **Web Scraping** - Automated content ingestion from construction/renovation websites

## Tech Stack

- **Next.js 15.3.3** - App Router with React 19
- **TypeScript** - Full type safety
- **Supabase** - PostgreSQL database with real-time features and pgvector
- **OpenAI API** - AI chat completions (gpt-4.1-nano) and embeddings
- **Tailwind CSS 4** - Modern styling
- **Radix UI** - Accessible component library
- **Playwright** - Web scraping automation
- **Cheerio** - HTML parsing and manipulation

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
   ```

3. **Database Setup:**
   ```bash
   # Run the complete setup script in your Supabase SQL Editor
   # Execute: supabase-migrations/supabase-complete-setup.sql
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

5. **Optional - Run FAQ Scraper:**
   ```bash
   # Scrape FAQ content from construction websites
   node scripts/faq-scraper.js --site=traguiden.se
   
   # Available options:
   node scripts/faq-scraper.js --site=traguiden.se --test     # Test mode
   node scripts/faq-scraper.js --site=traguiden.se --dry-run # Preview without saving
   node scripts/faq-scraper.js --site=traguiden.se --clean   # Clean existing data first
   ```

## Application Routes

### Public Routes
- `/` - Redirects to dashboard (no landing page)
- `/auth` - Admin authentication page
- `/widget` - Embeddable chat widget for external websites

### Dashboard Routes (Protected)
- `/dashboard` - Overview with statistics (assistants, offers, revenue)
- `/dashboard/assistants` - Manage AI assistants (CRUD operations)
- `/dashboard/preview` - Live chat widget preview and testing
- `/dashboard/offers` - View and manage customer offers

## API Endpoints

- `POST /api/chat` - Chat interactions with OpenAI integration (saveOffer, searchFAQ tools)
- `GET /api/assistants` - Fetch available assistants from database

## Authentication

The application uses Supabase Authentication with admin-only access:

### Demo Credentials
- Email: `admin@buildla.com`
- Password: `admin123`

### Features
- Server-side authentication with Supabase Auth
- Protected dashboard routes
- Automatic session management
- Secure logout functionality

## Database Schema

The application uses Supabase with four main tables:

```sql
-- AI Assistant configurations
assistants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  system_prompt text NOT NULL,
  category text,
  created_at timestamp,
  updated_at timestamp
)

-- OpenAI model settings
model_settings (
  id uuid PRIMARY KEY,
  model varchar(50) NOT NULL,
  temperature decimal(3,2) NOT NULL,
  max_tokens integer NOT NULL,
  top_p decimal(3,2) NOT NULL,
  created_at timestamp,
  updated_at timestamp
)

-- Customer offers and quotes
offers (
  id uuid PRIMARY KEY,
  assistant_id uuid REFERENCES assistants(id),
  customer_info jsonb NOT NULL,
  offer_details jsonb NOT NULL,
  chat_messages jsonb,
  status text DEFAULT 'pending',
  created_at timestamp,
  updated_at timestamp
)

-- FAQ vector embeddings for semantic search
faq_embeddings (
  id uuid PRIMARY KEY,
  content text NOT NULL,
  url text NOT NULL,
  source text NOT NULL,
  content_hash text NOT NULL,
  embedding vector(1536),
  created_at timestamp,
  updated_at timestamp
)
```

## Key Features

### AI Assistant Management
- Create custom assistants with specific system prompts
- Categorize assistants by business type
- Real-time database storage with Supabase

### Specialized Quote System
- Bathroom renovation pricing calculator
- Complex Swedish market logic including:
  - Labor and material cost calculations
  - Transport and parking fees
  - ROT tax deduction (30% Swedish tax benefit)
  - Area-based pricing with modifiers

### Chat Widget Integration
- Embeddable chat widget for external websites
- Multi-assistant support with dynamic selection
- Copy-to-clipboard integration code

### FAQ System with Semantic Search
- AI-powered FAQ responses using vector embeddings
- Web scraping of wood construction content
- Source attribution with automatic citations
- Wood construction specialist assistant with domain expertise

## Deployment

Deploy to Vercel or similar platform:

```bash
pnpm run build
```

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_MAX_FILE_SIZE_MB` - Maximum file size in MB

## Usage

1. **Set up assistants** - Create and configure AI assistants in the dashboard
2. **Test functionality** - Use the preview page to test chat interactions
3. **Get embed code** - Copy the widget code for website integration
4. **Monitor performance** - Track offers and revenue in the dashboard
5. **Manage quotes** - Review and process customer inquiries
