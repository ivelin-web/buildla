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
- [ ] Dynamic widget sizing.  
- [ ] Remove blue/purple banner.  
- [ ] Change “AI is thinking” to Swedish text.  
- [ ] Remove “Are you ready?” step → start directly in the main conversation.  
- [ ] Add **“Restart”** button after contact details are collected.

## 4 · Real-Time Typing Effect
- [ ] Integrate **Vercel AI SDK** for streaming responses, providing:  
  - Smooth word-by-word output  
  - Immediate progress visibility  
  - Automatic retries on connection issues  
  - Mobile/slow-network optimization  
  - Professional chat UX

## 5 · Optional Enhancements
- [x] **One-click HTML code-generation button** for Squarespace (copies chat-interface code to clipboard).  
- [x] **Admin dashboard** to manage assistants, view generated offers, and live-preview the chat UI.  
- [x] **Model settings control** (temperature, max tokens, model selection) similar to the OpenAI interface.