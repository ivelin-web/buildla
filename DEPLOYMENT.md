# Step-by-Step Deployment Guide

This guide will help you deploy the AI chat widget to your Squarespace website in under 30 minutes.

## Prerequisites

- OpenAI API account with available credits
- Vercel account (free)
- Access to your Squarespace website

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "Squarespace Chat Widget"
4. **Important**: Copy the key immediately - you won't see it again!

## Step 2: Deploy to Vercel

### Option A: One-Click Deploy (Recommended)

1. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ivelin-web/squarespace-openai-chat)
2. Connect your GitHub account if needed
3. Name your project (e.g., "my-chat-widget")
4. Add environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key from Step 1
5. Click "Deploy"
6. Wait 2-3 minutes for deployment to complete
7. **Save your Vercel URL** - you'll need it for Squarespace

### Option B: Manual Deploy

```bash
# 1. Clone this repository
git clone <repository-url>
cd squarespace-openai-chat

# 2. Install Vercel CLI
npm i -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel

# 5. Add environment variable
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted

# 6. Redeploy to apply environment variables
vercel --prod
```

## Step 3: Test Your Deployment

1. Go to your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Add `/chat-widget.html` to the URL
3. You should see the chat widget
4. Select a service type and try sending a message
5. If it works, you're ready for Squarespace integration!

## Step 4: Integrate with Squarespace

### Prepare the Code

1. Open `squarespace-embed-code.html` from this project
2. Find this line near the top of the JavaScript:
   ```javascript
   const API_BASE = 'https://YOUR_VERCEL_URL.vercel.app';
   ```
3. Replace `YOUR_VERCEL_URL` with your actual Vercel project URL
4. Copy the entire file content

### Add to Squarespace

1. Login to your Squarespace website
2. Navigate to the page where you want the chat widget
3. Click the "+" button to add a new block
4. Select "Code" from the block options
5. Paste the code you copied in step 4
6. Click "Apply"
7. Save your page

## Step 5: Test on Squarespace

1. Preview your Squarespace page
2. The chat widget should appear
3. Test by selecting a service and chatting
4. If everything works, publish your page!

## Troubleshooting

### Chat Widget Not Showing

1. **Check Squarespace Plan**: Code blocks require a Business plan or higher
2. **JavaScript Disabled**: Ensure JavaScript is enabled in your browser
3. **Wrong Block Type**: Make sure you used a "Code" block, not "Markdown" or "Text"

### Widget Shows But Won't Chat

1. **Check Vercel URL**: Make sure you replaced `YOUR_VERCEL_URL` correctly
2. **API Key**: Verify your OpenAI API key is set in Vercel environment variables
3. **Credits**: Check your OpenAI account has available credits

### Error Messages

| Error | Solution |
|-------|----------|
| "Failed to load available services" | Vercel URL is wrong or deployment failed |
| "OpenAI API key not configured" | Add OPENAI_API_KEY to Vercel environment variables |
| "Failed to get response from OpenAI" | Check OpenAI credits and API key validity |

## Going Live Checklist

- [ ] OpenAI API key is set in Vercel
- [ ] Vercel deployment is successful
- [ ] Test widget works on Vercel standalone page
- [ ] Vercel URL is correctly replaced in embed code
- [ ] Widget appears on Squarespace preview
- [ ] Chat functionality works on Squarespace
- [ ] Page is published

## Post-Launch

### Monitor Usage

1. Check [OpenAI Usage Dashboard](https://platform.openai.com/usage) regularly
2. Set up billing alerts to avoid unexpected charges
3. Monitor Vercel function usage in your dashboard

### Add More Services

To add new service types (beyond the 5 included):

1. Edit the task configuration in `api/chat.js` and `api/tasks.js`
2. Redeploy with `vercel --prod`
3. No changes needed in Squarespace

### Customize Appearance

1. Edit the CSS in your embedded code
2. Update colors, fonts, sizes to match your brand
3. Save changes in Squarespace

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel function logs for errors
3. Verify OpenAI API key and credits
4. Contact support with specific error messages

**Deployment complete!** Your AI chat widget should now be live on your Squarespace website.