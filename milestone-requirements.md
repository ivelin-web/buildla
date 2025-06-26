# Milestone 1 – Price Agents Full Setup ($600)

## 1 · Architecture
- [x] **Migrate** the app from standalone serverless functions to a **full Next.js project** with **Supabase**.
- [x] Create a **database connection** to store offers and customer data.

## 2 · File Upload
- [ ] Implement **PDF upload** (priority 1).  
- [ ] Implement **image upload** (priority 2).  
- [ ] Enable **multiple-file uploads** (priority 3).  
  > *If it becomes too complex for the AI to process, keep PDF only.*

## 3 · UI Improvements
- [x] Dynamic widget sizing.  
- [x] Remove blue/purple banner.  
- [ ] Change "AI is thinking" to Swedish text.  
- [x] Remove "Are you ready?" step → start directly in the main conversation.  
- [x] Add **"Restart"** button after contact details are collected.

## 4 · Real-Time Typing Effect
- [x] Integrate **Vercel AI SDK** for streaming responses, providing:  
  - Smooth word-by-word output  
  - Immediate progress visibility  
  - Automatic retries on connection issues  
  - Mobile/slow-network optimization  
  - Professional chat UX

## 5 · Offer Management System
- [x] **Save AI-generated offers** to Supabase database instead of hardcoded data.
- [x] **Display real offers** in the admin dashboard from the database.

## 6 · Optional Enhancements
- [x] **One-click HTML code-generation button** for Squarespace (copies chat-interface code to clipboard).  
- [x] **Admin dashboard** to manage assistants, view generated offers, and live-preview the chat UI.  
- [x] **Model settings control** (temperature, max tokens, model selection) similar to the OpenAI interface.