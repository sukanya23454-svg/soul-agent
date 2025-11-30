# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/68059f3e-003a-4e5f-a07d-39e515c66592

---

# AI Agent Platform

A powerful platform for creating, managing, and deploying custom AI agents with specialized abilities, memory systems, and automation features.

## Features

### Core Features
- ✅ **Custom AI Agents** - Create agents with unique personalities and instructions
- ✅ **Specialized Agent Types** - Study, Analytics, Fitness, Finance, and Content Creator agents
- ✅ **50+ Built-in Abilities** - Flashcard generation, quiz creation, trend prediction, workout plans, and more
- ✅ **Memory System** - Agents remember important context across conversations
- ✅ **File Analysis** - Upload and analyze documents with your agents
- ✅ **Automation** - Schedule automated tasks and reminders

### Community Features
- ✅ **Public Marketplace** - Discover and clone agents from the community
- ✅ **Ratings & Reviews** - Rate and review public agents
- ✅ **Comments** - Discuss agents with the community
- ✅ **Like/Save** - Save your favorite agents
- ✅ **Follow Creators** - Follow your favorite agent creators
- ✅ **Activity Feed** - See what's happening in the community
- ✅ **Leaderboards** - Track top agents and creators

### User Features
- ✅ **User Profiles** - Customize your public profile
- ✅ **Private & Public Agents** - Control agent visibility
- ✅ **Chat History** - All conversations are saved
- ✅ **Streaks & Stats** - Track your usage and engagement

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: Groq API (LLaMA 3.3 70B model)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/68059f3e-003a-4e5f-a07d-39e515c66592) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Agent Types & Abilities

### Study Agents
- Flashcard Generator
- Quiz Generator  
- ELI5 Explainer
- Concept Explainer
- Memory Techniques
- Study Guide Creator

### Analytics Agents
- Chart Generator
- Trend Predictor
- Data Summarizer

### Fitness Agents  
- Custom Workout Plans
- Calorie Plan Generator
- Fitness Habit Tracker

### Finance Agents
- Budget Breakdown
- Spending Insights
- Financial Table Generator

### Content Creator Agents
- Instagram Caption Generator
- TikTok Script Generator
- Hook & CTA Templates

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Database)
- Groq AI (LLaMA 3.3 70B)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/68059f3e-003a-4e5f-a07d-39e515c66592) and click on Share -> Publish.

For detailed deployment instructions to Vercel, Netlify, or Cloudflare Pages, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Database Setup

The database schema includes:
- `agents` - AI agent definitions
- `abilities` - Available agent abilities  
- `agent_abilities` - Agent-ability relationships
- `messages` - Chat history
- `agent_memories` - Agent memory storage
- `agent_automations` - Scheduled automations
- `user_profiles` - User profile data
- `agent_likes`, `agent_ratings`, `agent_comments` - Community features
- `user_follows` - User follow relationships
- `activity_feed` - Community activity

All migrations are managed automatically through Supabase.

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ JWT-based authentication
- ✅ Secure edge functions
- ✅ Input validation and sanitization

## Support

For issues and questions:
- Use Lovable's built-in support
- Check [Lovable Documentation](https://docs.lovable.dev)
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help

## License

MIT License