# Quick Start Guide

## Creating PWA Icons (2 minutes)

1. **Open the icon generator**:
   - Navigate to `frontend/public/create-icons.html`
   - Double-click to open in your browser

2. **Download the icons**:
   - Click "📥 Download 192x192" → Save as `icon-192.png` in `frontend/public/`
   - Click "📥 Download 512x512" → Save as `icon-512.png` in `frontend/public/`

3. **Verify**:
   - Check that both files exist in `frontend/public/`
   - Icons are ready! ✅

## Testing Locally on Mobile

1. **Start servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Find your computer's IP**:
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` → Look for inet address

3. **On your mobile device**:
   - Connect to same WiFi network
   - Open browser: `http://YOUR_IP:5173`
   - Test recording, camera, etc.

4. **Install as app**:
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Install App

## Deploying to Production

See `HTTPS_SETUP.md` for detailed deployment options:

- **Easiest**: Vercel (frontend) + Railway (backend)
- **Custom domain**: Cloudflare (free SSL)
- **Self-hosted**: Let's Encrypt + Nginx

## Need Help?

- Mobile setup: See `MOBILE_SETUP.md`
- HTTPS setup: See `HTTPS_SETUP.md`
- General info: See `README.md`
