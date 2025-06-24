# Buildla AI Assistant

A Next.js platform that enables businesses to create intelligent AI assistants for their Squarespace websites, with specialized focus on construction and renovation services.

## Features

- 🤖 **AI Assistant Management** - Create, edit, and delete custom AI assistants with OpenAI
- 💰 **Automated Quote Generation** - Specialized bathroom renovation pricing with Swedish market logic
- 📊 **Dashboard** - Comprehensive management interface with statistics and performance monitoring
- 🎨 **Modern UI** - Built with Next.js 15, Tailwind CSS 4, and Radix UI components
- 🔗 **Embeddable Chat Widget** - Easy integration code for external websites
- 🇸🇪 **Swedish Market Focus** - ROT tax deduction calculations and local pricing

## Tech Stack

- **Next.js 15.3.3** - App Router with React 19
- **TypeScript** - Full type safety
- **Supabase** - PostgreSQL database with real-time features
- **OpenAI API** - AI chat completions (gpt-4.1-nano)
- **Tailwind CSS 4** - Modern styling
- **Radix UI** - Accessible component library

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
   ```

3. **Database Setup:**
   ```bash
   # Run the migration to set up Supabase tables
   # Execute the SQL in supabase-migration.sql in your Supabase dashboard
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

## Application Routes

### Public Routes
- `/` - Landing page showcasing the platform
- `/auth` - Authentication page

### Dashboard Routes (Protected)
- `/dashboard` - Overview with statistics (assistants, offers, revenue)
- `/dashboard/assistants` - Manage AI assistants (CRUD operations)
- `/dashboard/preview` - Live chat widget preview and testing
- `/dashboard/offers` - View and manage customer offers

## API Endpoints

- `POST /api/chat` - Chat interactions with OpenAI integration
- `GET /api/assistants` - Fetch available assistants from database

## Demo Credentials

For testing the dashboard:
- Email: `admin@buildla.com`
- Password: `admin123`

## Database Schema

The application uses Supabase with the following main table:

```sql
assistants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  system_prompt text NOT NULL,
  category text,
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

## Deployment

Deploy to Vercel or similar platform:

```bash
pnpm run build
```

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Usage

1. **Set up assistants** - Create and configure AI assistants in the dashboard
2. **Test functionality** - Use the preview page to test chat interactions
3. **Get embed code** - Copy the widget code for website integration
4. **Monitor performance** - Track offers and revenue in the dashboard
5. **Manage quotes** - Review and process customer inquiries
