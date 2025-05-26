# AI Chat Widget for Squarespace

A professional OpenAI-powered chat widget that can be easily embedded into Squarespace websites. Features multiple task types with specialized prompts for construction, renovation, landscaping, painting, and roofing services.

## Features

✅ **Secure API Key Handling** - Your OpenAI API key stays safe on the server  
✅ **Multi-Task Support** - 5 specialized service types with dedicated prompts  
✅ **Clean UI** - Modern, responsive design that fits any website  
✅ **Easy Squarespace Integration** - Simple copy-paste embedding  
✅ **Mobile Responsive** - Works perfectly on all devices  
✅ **Real-time Chat** - Fast responses with loading indicators  

## Quick Start

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ivelin-web/squarespace-openai-chat)

Or manually:

```bash
# Clone the repository
git clone <repository-url>
cd squarespace-openai-chat

# Install dependencies
pnpm install

# Set up environment variables  
cp env.example .env
# Edit .env and add your OpenAI API key

# Deploy to Vercel
pnpm deploy
```

### 2. Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `OPENAI_API_KEY` with your OpenAI API key

### 3. Embed in Squarespace

1. Copy the code from `squarespace-embed-code.html`
2. Replace `YOUR_VERCEL_URL` with your actual Vercel deployment URL
3. In Squarespace, add a Code Block where you want the chat
4. Paste the code and save

## Project Structure

```
squarespace-openai-chat/
├── api/
│   ├── chat.js          # Main chat endpoint
│   └── tasks.js         # Tasks configuration endpoint
├── public/
│   └── chat-widget.html # Standalone widget demo
├── squarespace-embed-code.html # Squarespace embedding code
├── package.json
├── vercel.json
├── env.example
└── README.md
```

## Available Tasks

The widget supports 5 specialized service types:

1. **Construction Work Offers** - General construction projects and estimates
2. **Home Renovation** - Room-specific renovations and planning
3. **Landscaping Services** - Garden design and outdoor projects  
4. **Painting Services** - Interior and exterior painting quotes
5. **Roofing Services** - Roof repair and replacement estimates

## API Endpoints

### `GET /api/tasks`
Returns available task types for the dropdown menu.

**Response:**
```json
{
  "tasks": [
    {
      "id": "construction",
      "name": "Construction Work Offers", 
      "description": "Get quotes for construction projects"
    }
  ]
}
```

### `POST /api/chat`
Processes chat messages with OpenAI.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "I need help with a kitchen renovation"}
  ],
  "taskId": "renovation"
}
```

**Response:**
```json
{
  "reply": "I'd be happy to help with your kitchen renovation...",
  "taskName": "Home Renovation"
}
```

## Customization

### Adding New Tasks

1. Edit `api/chat.js` and add your task to `TASK_PROMPTS`:

```javascript
const TASK_PROMPTS = {
  // ... existing tasks
  plumbing: {
    name: "Plumbing Services",
    systemPrompt: `You are a professional plumber. Help customers with plumbing estimates and advice.`
  }
};
```

2. Edit `api/tasks.js` and add the corresponding task info:

```javascript
const TASKS = {
  // ... existing tasks
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing Services',
    description: 'Plumbing repairs and installations'
  }
};
```

### Styling Customization

The widget uses CSS custom properties for easy theming. Edit the styles in `squarespace-embed-code.html`:

```css
#ai-chat-container .ai-chat-widget {
  /* Change colors, fonts, sizes, etc. */
  background: #ffffff;
  border-radius: 12px;
  font-family: 'Your Custom Font', sans-serif;
}
```

### OpenAI Model Configuration

In `api/chat.js`, you can adjust the OpenAI settings:

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4.1-nano',
  max_tokens: 1000, // Adjust response length
  temperature: 0.7, // Adjust creativity (0-1)
});
```

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Set up local environment variables
cp env.example .env
# Edit .env and add your OpenAI API key

# Option 1: Full API testing with Vercel CLI (Recommended)
vercel dev --listen 3000
# Then visit: http://localhost:3000/chat-widget.html

# Option 2: Frontend-only testing (no API calls)
# Simply open public/chat-widget.html in your browser
```

### Testing

1. Visit the deployed widget URL
2. Select a service type from the dropdown
3. Start chatting to test the OpenAI integration
4. Check browser console for any errors

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## Troubleshooting

### Widget Not Loading

1. Check that `YOUR_VERCEL_URL` is correctly replaced in the embed code
2. Verify your Vercel deployment is successful
3. Check browser console for CORS or network errors

### API Errors

1. **For Production**: Verify your OpenAI API key is set correctly in Vercel Dashboard
2. **For Local Development**: Ensure you have a `.env` file with `OPENAI_API_KEY` set
3. Check that your OpenAI account has sufficient credits
4. Review the Vercel function logs for detailed error messages
5. Try restarting `vercel dev` if environment variables were recently changed

### Squarespace Integration Issues

1. Make sure you're using a Code Block (not other block types)
2. Try pasting the code in different sections of your page
3. Check that Squarespace allows JavaScript execution in your plan

## Security

- ✅ API key is never exposed to the frontend
- ✅ All requests go through your secure Vercel backend
- ✅ CORS configured for secure cross-origin requests
- ✅ Input validation on all API endpoints

## Cost Optimization

To minimize OpenAI costs:

1. Use `gpt-4.1-nano` instead of `gpt-4o` for lower costs
2. Reduce `max_tokens` if shorter responses are acceptable
3. Set up usage monitoring in your OpenAI dashboard

## Support

If you need help with setup or customization, please:

1. Check this documentation first
2. Review the troubleshooting section
3. Check Vercel and OpenAI logs for error messages