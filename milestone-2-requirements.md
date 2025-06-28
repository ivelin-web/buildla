# Milestone 2 – FAQ Agent Implementation

## Simple Plan: Scrape → Embed → Store → Search → Answer

### 1 · Database Setup
- [ ] Enable **pgvector extension** in Supabase
- [ ] Create **faq_embeddings** table with vector column
- [ ] Add HNSW similarity search index

### 2 · Scraper + Embeddings Script
- [ ] Install **Playwright** and **Cheerio**
- [ ] Create single script to scrape all pages from sitemap
- [ ] Extract clean text content from each page
- [ ] Smart chunking (800-1000 tokens) with overlap for context preservation
- [ ] Generate embeddings using **text-embedding-3-small**
- [ ] Store embeddings directly in Supabase table with rate limiting

### 3 · FAQ Search Tool
- [ ] Create semantic search function in `src/lib/faq-search.ts`
- [ ] Add **searchFAQ** tool to existing chat API
- [ ] Tool converts user question to embedding and searches database
- [ ] Return top 3-5 most relevant chunks with source URLs

### 4 · FAQ Assistant Integration
- [ ] Create new FAQ assistant in database with specialized system prompt
- [ ] Leverage existing chat system (no new endpoints needed)
- [ ] AI uses searchFAQ tool automatically when FAQ assistant is selected
- [ ] Include source citations in responses

## Technical Approach
- **Scraping**: Playwright (better for dynamic content like accordions)
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **Storage**: Supabase with pgvector
- **Search**: HNSW index with cosine similarity
- **Integration**: Extend existing chat system with new tool

## Database Schema
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Simple but effective schema
CREATE TABLE faq_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),  -- text-embedding-3-small dimensions
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast similarity search (better than IVFFlat)
CREATE INDEX ON faq_embeddings USING hnsw (embedding vector_cosine_ops);
```

## Files to Create/Modify
- `scripts/faq-scraper.js` - Scrape website + generate embeddings + store in DB
- `src/lib/faq-search.ts` - Semantic search function
- Update `src/app/api/chat/route.ts` - Add searchFAQ tool
- Add FAQ assistant to database

## Dependencies
```bash
pnpm add playwright cheerio
```

---

# Senior Developer Complete Implementation Plan

## Why This Approach Works

1. **Leverages Existing Architecture** - Uses your current chat system instead of building new endpoints
2. **Playwright Over Puppeteer** - Better handling of dynamic content, accordions, and 2500+ pages
3. **Simple Database Design** - No over-engineering, just what's needed
4. **Tool-Based Integration** - Same pattern as your `saveOffer` tool

## Implementation Steps

### Step 1: Database Setup (5 minutes)
Run the SQL schema above in Supabase dashboard.

### Step 2: Install Dependencies
```bash
pnpm add playwright cheerio
```

### Step 3: Create Scraper Script
- Parse sitemap for all URLs
- Use Playwright to handle dynamic content
- Smart chunking with 100-token overlap
- Batch embedding generation
- Store in database with rate limiting

### Step 4: Add Search Tool to Chat API
Add `searchFAQ` tool to `/api/chat/route.ts` similar to your existing `saveOffer` tool:
- Convert query to embedding
- Search vector database
- Return relevant chunks

### Step 5: Create FAQ Assistant
Add new assistant to database with system prompt optimized for FAQ responses.

## Key Benefits
✅ **2-3 days implementation** vs weeks of over-engineering  
✅ **Builds on existing solid architecture**  
✅ **Handles dynamic content properly**  
✅ **Simple, maintainable code**  
✅ **No new endpoints or complex systems**
