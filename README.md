# AI Content Marketing Campaign Generator

An intelligent multi-agent system that automates content marketing campaign creation using advanced AI agents.

## Features

- **Multi-Agent System**: Specialized AI agents work together to create comprehensive marketing campaigns
- **Research Agent**: Analyzes competitors and market trends
- **Content Strategist**: Plans content calendar and strategy
- **Writer Agent**: Creates engaging blog posts and articles
- **Social Media Agent**: Generates platform-specific social content
- **Image Generator**: Creates custom visuals using Stable Diffusion
- **Beautiful UI**: Modern React interface with real-time progress tracking

## Tech Stack

### Backend
- FastAPI
- Google Gemini AI (free tier)
- HuggingFace Transformers
- SQLite database
- Python 3.10+

### Frontend
- React + Vite
- TailwindCSS
- Shadcn/ui components
- WebSocket for real-time updates

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google AI API key (Gemini)
- HuggingFace API token

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Open http://localhost:5173 in your browser
2. Enter your product/service details and target audience
3. Watch as AI agents collaborate to create your campaign
4. Download generated content and images
5. Review and customize as needed

## Demo

Perfect for demonstrating to clients:
- Real-time agent collaboration
- Professional content generation
- Beautiful, modern interface
- End-to-end campaign automation

## Architecture

The system uses an orchestrator pattern where specialized agents work autonomously but coordinate through a central orchestrator. Each agent has specific tools and capabilities, showcasing true agentic AI behavior.

## License

MIT
