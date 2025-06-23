# Buildla AI Assistant - Next.js App

A modern Next.js application for managing AI-powered chat assistants that can be embedded in Squarespace websites.

## Features

- 🤖 **AI Chat Assistants** - Create custom AI assistants with OpenAI
- 💰 **Automated Quotes** - Generate pricing quotes automatically  
- 📊 **Dashboard** - Manage assistants, view offers, and monitor performance
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🔗 **Easy Embedding** - Simple iframe code for Squarespace integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Homepage: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Auth: http://localhost:3000/auth

## Demo Credentials

For the admin dashboard:
- Email: `admin@buildla.com`
- Password: `admin123`

## API Endpoints

- `POST /api/chat` - Chat with AI assistant
- `GET /api/tasks` - Get available tasks/assistants
- `POST /api/admin/tasks` - Create/manage assistants (auth required)
- `GET /api/admin/offers` - View generated offers (auth required)
- `POST /api/save-offer` - Save customer offers

## Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **OpenAI API** - AI functionality

## Migration from Vercel Functions

This app replaces the previous Vercel serverless functions setup with a full Next.js application for better scalability and development experience.

## Deployment

Deploy to Vercel:

```bash
npm run build
# Deploy with Vercel CLI or connect GitHub repo
```

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.

## Usage

1. **Create AI Assistants** - Define tasks and system prompts
2. **Test in Dashboard** - Use the chat preview to test functionality  
3. **Get Embed Code** - Copy the iframe code for your assistant
4. **Embed in Squarespace** - Paste the code in a Code Block
5. **Monitor Performance** - View generated offers and statistics

## Database Integration

Currently uses in-memory storage. Ready for database integration with Supabase or similar.
