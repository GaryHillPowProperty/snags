# Mobile App Setup Guide

Your Snag Management System is now a Progressive Web App (PWA) that can be installed on mobile devices!

## Features

✅ **Mobile-Optimized UI** - Touch-friendly buttons and responsive layouts
✅ **Camera Integration** - Direct camera access for taking photos/videos
✅ **Voice Recording** - Native microphone recording support
✅ **Offline Capable** - Service worker caches app for offline use
✅ **Installable** - Can be installed as an app on iOS and Android

## Setting Up Icons

Before deploying, you need to create PWA icons:

### Option 1: Use the HTML Icon Generator (Easiest - Recommended)

1. Open `frontend/public/create-icons.html` in your browser
2. Click "📥 Download 192x192" button
3. Save the file as `icon-192.png` in `frontend/public/` folder
4. Click "📥 Download 512x512" button  
5. Save the file as `icon-512.png` in `frontend/public/` folder

The icons feature a blue gradient background with a white microphone icon - perfect for your snag management app!

### Option 2: Use Node.js Script

If you have Node.js installed:
```bash
cd frontend
node scripts/create-icons.js
```

This will automatically generate both icon files.

### Option 3: Create Custom Icons

Create two PNG files:
- `frontend/public/icon-192.png` (192x192 pixels)
- `frontend/public/icon-512.png` (512x512 pixels)

Use your company logo or a microphone icon. The icons should be square and work well at small sizes.

## Installing on Mobile Devices

### iOS (iPhone/iPad)

1. Open Safari browser (Chrome won't work for PWA installation on iOS)
2. Navigate to your app URL
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Customize the name if desired
6. Tap "Add"

### Android

1. Open Chrome browser
2. Navigate to your app URL
3. Tap the menu (three dots)
4. Tap "Install app" or "Add to Home screen"
5. Confirm installation

## Mobile Usage Tips

- **Voice Recording**: Tap the microphone button to start recording. The app will request microphone permission on first use.
- **Camera**: Use the "Take Photo/Video" button for direct camera access, or "Choose Files" to select from gallery.
- **Offline Mode**: The app caches resources for offline use. Recordings and uploads will sync when connection is restored.
- **Full Screen**: When installed, the app runs in full-screen mode without browser UI.

## Deployment Considerations

### For Production:

1. **HTTPS Required**: PWAs require HTTPS (except localhost). Use:
   - Let's Encrypt for free SSL certificates
   - Cloudflare for easy HTTPS setup
   - Heroku, Vercel, or Netlify for hosted solutions

2. **Update Service Worker**: The service worker version (`CACHE_NAME` in `sw.js`) should be incremented when deploying updates.

3. **Backend URL**: Update the API proxy in `vite.config.js` for production, or configure environment variables.

4. **CORS**: Ensure your backend allows requests from your production domain.

## Testing Locally

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. On mobile device, connect to the same network
4. Find your computer's IP address (e.g., `ipconfig` on Windows, `ifconfig` on Mac/Linux)
5. Open `http://YOUR_IP:5173` on your mobile device
6. Test installation and features

## Troubleshooting

**Icons not showing**: Ensure icon files exist in `frontend/public/` and manifest.json references them correctly.

**Service worker not registering**: Check browser console for errors. Ensure you're using HTTPS (or localhost).

**Camera not working**: Ensure you've granted camera permissions in browser settings.

**Install prompt not appearing**: 
- iOS: Must use Safari, not Chrome
- Android: Chrome will show install prompt after visiting site a few times
- Ensure manifest.json is valid and icons are present
