# 🚀 AI Chat Widget Setup Guide - Step by Step

**Welcome!** This guide will help you set up your AI chat widget. Follow each step carefully - no coding experience needed!

## 🔧 Step 1: Get Your OpenAI API Key (5 minutes)

1. Go to: https://platform.openai.com/api-keys
2. **Create an account** if you don't have one (it's free to start)
3. Click **"Create new secret key"**
4. **Copy the key** - it looks like: `sk-abc123...` 
5. **Save it somewhere safe** - you'll need it in Step 3

⚠️ **Important**: This key is like a password - don't share it with anyone!

---

## 🚀 Step 2: Deploy Your Chat Widget (5 minutes)

**Option A: Easy One-Click Deploy (Recommended)**
1. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ivelin-web/squarespace-openai-chat)
2. **Sign up for Vercel** (it's free) using your GitHub, GitLab, or Bitbucket account
3. Give your project a name (like "my-chat-widget")
4. Click **"Deploy"**
5. Wait 2-3 minutes for it to finish

**Your website URL** will be shown when done - it looks like: `https://your-project-name.vercel.app`
**Copy and save this URL** - you'll need it later!

---

## 🔑 Step 3: Add Your OpenAI Key (2 minutes)

1. In Vercel, go to your project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left menu
4. Click **"Add New"**
5. In **"Name"** field, type: `OPENAI_API_KEY`
6. In **"Value"** field, paste your OpenAI key from Step 1
7. Click **"Save"**
8. Go back to **"Deployments"** tab and click **"Redeploy"** (this updates your site)

---

## ✅ Step 4: Test Your Widget (2 minutes)

1. Go to: `https://your-project-name.vercel.app/chat-widget.html`
   (Replace "your-project-name" with your actual project name)
2. You should see a chat widget
3. Select "Swedish Bathroom Renovation Assistant" from the dropdown
4. Type a test message like "Hello" or "Hej"
5. The AI should respond in Swedish

**If it works** ✅ - Great! Move to Step 5
**If it doesn't work** ❌ - Check that you added the OpenAI key correctly in Step 3

---

## 🔗 Step 5: Add to Your Squarespace Website (5 minutes)

1. **Open the file** called `squarespace-embed-code.html` (in your project files)
2. **Find this line**: `YOUR_VERCEL_URL_HERE`
3. **Replace it** with your actual URL from Step 2
4. **Copy the entire code** from the file
5. **In Squarespace**:
   - Edit the page where you want the chat
   - Add a **"Code Block"**
   - Paste the code
   - Save and publish

**Done!** Your chat widget is now live on your website! 🎉

---

# 🎨 How to Customize Your Chat Widget

## 📁 Important: Two Files to Edit

**Always edit BOTH files when making changes:**
- **For testing**: `public/chat-widget.html` 
- **For your website**: `squarespace-embed-code.html`

## 🔧 Quick Changes

### Change Header Text
Find: `<p>Testing the Swedish bathroom renovation assistant</p>`  
Change to: Whatever you want

### Change Welcome Message  
Find: `Testing started! The AI will respond in Swedish...`  
Change to: Your message

### Change Placeholder Text
Find: `placeholder="Type your message (will respond in Swedish)..."`  
Change to: Your placeholder

### Change Main Colors
Find: `#667eea` and `#764ba2`  
Change to: Your color codes ([get colors here](https://htmlcolorcodes.com/))

### Change Button Color
Find: `background: #667eea;`  
Change to: Your button color

## Add New Chat Services/Tasks

### Step 1: Add New Task
**File to edit**: `api/tasks.js`
**What to find**: The tasks array
**Add your new task** like this:
```javascript
{
    id: 'new-service',
    name: 'Your New Service',
    description: 'What this service does',
    systemPrompt: 'You are a helpful assistant for...'
}
```

### Step 2: Update the AI Instructions
In the `systemPrompt`, write clear instructions for how the AI should behave for this new service.

**Example**:
```javascript
systemPrompt: 'You are a helpful assistant for kitchen renovations. Always respond in Swedish. Help users plan their kitchen renovation, suggest materials, and provide cost estimates.'
```

## 📤 How to Update Your Website After Changes

### For Squarespace embed code changes:
**Easy!** Just replace the code block in Squarespace with your updated code. Done!

### For project file changes (colors, tasks, etc.):

**Method 1: Through GitHub (Automatic - Easiest!)**
1. **Go to your GitHub repository** (created when you clicked the deploy button)
2. **Click on the file** you want to edit (like `public/chat-widget.html`)
3. **Click the pencil icon** to edit
4. **Make your changes** directly in the browser
5. **Click "Commit changes"** at the bottom
6. **Wait 2-3 minutes** - Vercel will automatically update your website!

**Method 2: Download and Re-upload**
1. **Download your project** from GitHub (green "Code" button → "Download ZIP")
2. **Edit the files** on your computer
3. **Upload the changed files** back to GitHub
4. **Vercel updates automatically**

**That's it!** Your changes will be live without changing any URLs. 