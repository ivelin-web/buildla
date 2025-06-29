#!/usr/bin/env node

/**
 * Multi-Website FAQ Scraper for Buildla - Task 2 (Simplified)
 * 
 * Scrapes multiple websites using configuration, generates embeddings, and stores in Supabase
 * Clean, minimal implementation focusing on core functionality
 * 
 * Usage: 
 *   node scripts/faq-scraper.js --site=traguiden.se --test
 *   node scripts/faq-scraper.js --site=traguiden.se --limit=10
 *   node scripts/faq-scraper.js --site=traguiden.se --dry-run
 */

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

// Load website configurations
const websiteConfigs = JSON.parse(
  await fs.readFile(path.join(__dirname, 'website-configs.json'), 'utf-8')
);

// Global configuration
const CONFIG = {
  DELAY_BETWEEN_BATCHES: 1000, // ms between embedding batches
  BATCH_SIZE: 20, // embeddings per batch
  TEST_LIMIT: 5, // pages for testing
};

// Current website config (will be set dynamically)
let currentSiteConfig = null;

// Initialize clients
let supabase, openai, browser, page;

/**
 * Initialize all required clients and services
 */
async function initializeClients() {
  // Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  
  // OpenAI client
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  
  openai = new OpenAI({ apiKey: openaiKey });
  
  // Playwright browser
  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  log('✅ Clients initialized successfully');
}

/**
 * Simple logging
 */
function log(message) {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Validate website configuration has all required fields
 */
function validateSiteConfig(config, siteName) {
  const requiredFields = [
    'name', 'baseUrl', 'sitemapUrl', 'contentSelectors', 
    'excludeSelectors', 'fallbackUrls', 'rateLimit', 'chunkSize', 'chunkOverlap'
  ];
  
  const missing = requiredFields.filter(field => 
    config[field] === undefined || config[field] === null
  );
  
  if (missing.length > 0) {
    throw new Error(`Website config for '${siteName}' missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate array fields
  const arrayFields = ['contentSelectors', 'excludeSelectors', 'fallbackUrls'];
  arrayFields.forEach(field => {
    if (!Array.isArray(config[field])) {
      throw new Error(`Website config field '${field}' must be an array`);
    }
  });
  
  // Validate numeric fields
  const numericFields = ['rateLimit', 'chunkSize', 'chunkOverlap'];
  numericFields.forEach(field => {
    if (typeof config[field] !== 'number' || config[field] < 0) {
      throw new Error(`Website config field '${field}' must be a positive number`);
    }
  });
  
  log(`✅ Website config validation passed for ${siteName}`);
}


/**
 * Parse sitemap.xml to get all page URLs
 */
async function getSitemapUrls() {
  try {
    log('🗺️ Fetching sitemap...');
    
    // Fetch raw XML directly (bypass browser XML viewer)
    const response = await fetch(currentSiteConfig.sitemapUrl);
    const content = await response.text();
    
    const $ = cheerio.load(content, { xmlMode: true });
    const urls = [];
    
    // Support both http and https URLs
    const baseHttps = currentSiteConfig.baseUrl;
    const baseHttp = currentSiteConfig.baseUrl.replace('https://', 'http://');
    
    // Extract URLs from sitemap
    $('loc').each((_, element) => {
      const url = $(element).text().trim();
      if (url && (url.startsWith(baseHttps) || url.startsWith(baseHttp))) {
        urls.push(url);
      }
    });
    
    // Fallback to configured URLs if sitemap is empty
    if (urls.length === 0) {
      log('⚠️ No sitemap URLs found, using fallback pages');
      return currentSiteConfig.fallbackUrls.map(path => currentSiteConfig.baseUrl + path);
    }
    
    log(`📄 Found ${urls.length} URLs`);
    return urls;
  } catch (error) {
    log(`❌ Error fetching sitemap: ${error.message}`);
    log('🔄 Using fallback URLs from config');
    return currentSiteConfig.fallbackUrls.map(path => currentSiteConfig.baseUrl + path);
  }
}

/**
 * Extract and clean content from HTML using cheerio
 */
function extractPageContent(htmlContent, url) {
  const $ = cheerio.load(htmlContent);
  
  // Remove unwanted elements using config
  const excludeSelector = currentSiteConfig.excludeSelectors.join(', ');
  $(excludeSelector).remove();
  $('[class*="nav"], [class*="menu"], [class*="sidebar"], [class*="ad"]').remove();
  
  // Extract title
  const title = $('title').text().trim() || $('h1').first().text().trim() || '';
  
  // Extract main content using config selectors
  const contentSelector = currentSiteConfig.contentSelectors.join(', ');
  const mainContent = $(contentSelector).first();
  const contentText = mainContent.length > 0 
    ? mainContent.text() 
    : $('body').text();
  
  // Clean up text
  const cleanText = contentText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  if (cleanText.length < 100) {
    throw new Error('Content too short - likely extraction failed');
  }
  
  return {
    url,
    title,
    content: cleanText
  };
}

/**
 * Scrape a page using Playwright and extract content
 */
async function scrapePageContent(url) {
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for dynamic content to load
    await page.waitForTimeout(1000);
    
    // Try to expand any accordions or collapsible content
    try {
      await page.locator('details:not([open])').click({ timeout: 2000 });
      await page.locator('.accordion:not(.expanded)').click({ timeout: 2000 });
      await page.locator('[data-toggle="collapse"]:not(.collapsed)').click({ timeout: 2000 });
    } catch {
      // Ignore if no expandable content found
    }
    
    const htmlContent = await page.content();
    return extractPageContent(htmlContent, url);
    
  } catch (error) {
    log(`❌ Error scraping ${url}: ${error.message}`);
    throw error;
  }
}


/**
 * Smart text chunking with overlap
 */
function chunkText(content, title, url) {
  const chunks = [];
  const words = content.split(/\s+/);
  const wordsPerToken = 0.75; // Rough estimate
  const wordsPerChunk = Math.floor(currentSiteConfig.chunkSize * wordsPerToken);
  const overlapWords = Math.floor(currentSiteConfig.chunkOverlap * wordsPerToken);
  
  for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    const chunkText = chunkWords.join(' ');
    
    if (chunkText.trim().length > 50) { // Minimum chunk size
      chunks.push({
        content: chunkText.trim(),
        url,
        title
      });
    }
  }
  
  return chunks;
}

/**
 * Generate embeddings in batches
 */
async function generateEmbeddings(chunks) {
  const embeddings = [];
  
  for (let i = 0; i < chunks.length; i += CONFIG.BATCH_SIZE) {
    const batch = chunks.slice(i, i + CONFIG.BATCH_SIZE);
    
    try {
      log(`🧠 Generating embeddings batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(chunks.length / CONFIG.BATCH_SIZE)}`);
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(chunk => chunk.content),
        encoding_format: 'float',
      });
      
      batch.forEach((chunk, index) => {
        embeddings.push({
          ...chunk,
          embedding: response.data[index].embedding
        });
      });
      
      // Rate limiting between batches
      if (i + CONFIG.BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
      }
      
    } catch (error) {
      log(`❌ Error generating embeddings: ${error.message}`);
      throw error;
    }
  }
  
  return embeddings;
}

/**
 * Store embeddings in Supabase
 */
async function storeEmbeddings(embeddings, dryRun = false) {
  try {
    if (dryRun) {
      log(`🔍 DRY-RUN: Would store ${embeddings.length} embeddings (skipping database write)`);
      return null;
    }
    
    log(`💾 Storing ${embeddings.length} embeddings...`);
    
    // Insert with source_website
    const { data, error } = await supabase
      .from('faq_embeddings')
      .insert(
        embeddings.map(item => ({
          content: item.content,
          embedding: item.embedding,
          url: item.url,
          title: item.title,
          source_website: currentSiteConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        }))
      );
    
    if (error) {
      throw error;
    }
    
    log(`✅ Stored ${embeddings.length} embeddings successfully`);
    return data;
    
  } catch (error) {
    log(`❌ Error storing embeddings: ${error.message}`);
    throw error;
  }
}


/**
 * Main scraping process
 */
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const isDryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const customLimit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
  const siteArg = args.find(arg => arg.startsWith('--site='));
  const siteName = siteArg ? siteArg.split('=')[1] : 'traguiden.se';
  
  try {
    // Set current site config
    currentSiteConfig = websiteConfigs[siteName];
    if (!currentSiteConfig) {
      throw new Error(`Website config not found for: ${siteName}. Available: ${Object.keys(websiteConfigs).join(', ')}`);
    }
    
    // Validate site configuration
    validateSiteConfig(currentSiteConfig, siteName);
    
    log('🚀 Starting FAQ scraper...');
    log(`📊 Mode: ${isTest ? 'TEST' : 'PRODUCTION'}${isDryRun ? ' (DRY-RUN)' : ''}`);
    log(`🌐 Website: ${currentSiteConfig.name} (${currentSiteConfig.baseUrl})`);
    
    await initializeClients();
    
    // Get all URLs
    const allUrls = await getSitemapUrls();
    
    // Apply limits
    let limit = null;
    if (isTest) limit = CONFIG.TEST_LIMIT;
    if (customLimit) limit = customLimit;
    
    const urlsToProcess = limit ? allUrls.slice(0, limit) : allUrls;
    log(`📝 Processing ${urlsToProcess.length} URLs`);
    
    let totalChunks = 0;
    let totalPages = 0;
    
    for (const [index, url] of urlsToProcess.entries()) {
      try {
        log(`📄 [${index + 1}/${urlsToProcess.length}] Processing: ${url}`);
        
        // Scrape page content
        const pageData = await scrapePageContent(url);
        
        // Create chunks
        const chunks = chunkText(pageData.content, pageData.title, pageData.url);
        log(`✂️ Created ${chunks.length} chunks`);
        
        if (chunks.length > 0) {
          // Generate embeddings
          const embeddings = await generateEmbeddings(chunks);
          
          // Store in database
          await storeEmbeddings(embeddings, isDryRun);
          
          totalChunks += chunks.length;
          totalPages++;
        }
        
        // Rate limiting
        if (index < urlsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, currentSiteConfig.rateLimit));
        }
        
      } catch (error) {
        log(`❌ Failed to process ${url}: ${error.message}`);
        continue;
      }
    }
    
    log('\n🎉 Scraping completed!');
    log(`📊 Statistics:`);
    log(`  Website: ${currentSiteConfig.name}`);
    log(`  Pages processed: ${totalPages}`);
    log(`  Chunks created: ${totalChunks}`);
    log(`  Average chunks per page: ${(totalChunks / totalPages).toFixed(1)}`);
    
  } catch (error) {
    log(`💥 Fatal error: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  log('\n🛑 Shutting down...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Run the scraper
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});