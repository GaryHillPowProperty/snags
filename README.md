# Snag Management System

A streamlined web application for building companies to automate snag management: voice recording and visual media → AI processing → automatic ClickUp task creation.

## Prerequisites

- Node.js 18+ and npm

## Setup

### Backend

1. Navigate to `backend/` and install dependencies:
   ```bash
   cd backend && npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and fill in your API keys:
   - `OPENAI_API_KEY` - From [OpenAI platform](https://platform.openai.com/api-keys)
   - `CLICKUP_API_TOKEN` - From ClickUp: Settings → Apps → Generate
   - `CLICKUP_LIST_ID` - The list ID where snag tasks will be created (from your list URL: `.../list/XXXXX`)

3. Start the backend:
   ```bash
   npm run dev
   ```
   Runs on http://localhost:3001

### Frontend

1. Navigate to `frontend/` and install dependencies:
   ```bash
   cd frontend && npm install
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Workflow

1. **Record/Upload** - Record voice or upload voice file (MP3, WAV, M4A), optionally add photos/videos/drawings
2. **Process** - AI transcribes and extracts structured snag data (snags, project, trade, deadline, materials, etc.)
3. **Review** - Edit snags, attach media to specific items, add drawing references
4. **Sync** - Create ClickUp tasks with all details and file attachments
5. **Dashboard** - View and filter snags, update status, sync individual items

## Mobile App (PWA)

This app is now a Progressive Web App (PWA) that can be installed on mobile devices!

- **Mobile-optimized** UI with touch-friendly controls
- **Camera integration** for direct photo/video capture
- **Voice recording** using device microphone
- **Offline capable** with service worker caching
- **Installable** on iOS and Android

See [MOBILE_SETUP.md](./MOBILE_SETUP.md) for detailed mobile setup and installation instructions.
