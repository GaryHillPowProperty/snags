# HTTPS Setup Guide for Production Deployment

This guide covers multiple options for setting up HTTPS for your Snag Management System PWA.

## Why HTTPS is Required

- **PWA Requirement**: Progressive Web Apps require HTTPS (except localhost)
- **Security**: Protects data transmission between mobile devices and your server
- **Browser Features**: Enables service workers, camera/microphone access, and other secure APIs
- **User Trust**: SSL certificates provide authentication and encryption

## Option 1: Using a Hosting Platform (Easiest)

### Vercel (Recommended for Frontend)

**Pros**: Free SSL, automatic deployments, great for React apps

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```
   Follow the prompts. Vercel will automatically:
   - Provide HTTPS
   - Configure your domain
   - Handle deployments

3. **Update API URLs**:
   - Create `frontend/.env.production`:
     ```
     VITE_API_URL=https://your-backend-domain.com
     ```
   - Update `frontend/src/services/api.js` to use `import.meta.env.VITE_API_URL`

4. **Deploy Backend Separately** (see backend options below)

### Netlify

Similar to Vercel:
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

### Railway / Render / Fly.io

These platforms provide HTTPS automatically:
- Railway: `railway up`
- Render: Connect GitHub repo, auto-deploys
- Fly.io: `fly launch` and `fly deploy`

## Option 2: Using Cloudflare (Free SSL Proxy)

**Best for**: Existing servers, custom domains, free SSL

### Setup Steps:

1. **Get a Domain** (if you don't have one):
   - Purchase from Namecheap, Google Domains, etc.
   - Or use a free subdomain from Freenom

2. **Point Domain to Cloudflare**:
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Add your domain
   - Update nameservers at your registrar to Cloudflare's

3. **Configure DNS**:
   - Add A record: `@` → Your server IP
   - Add A record: `www` → Your server IP
   - Enable "Proxy" (orange cloud) for SSL

4. **SSL Settings**:
   - Go to SSL/TLS → Overview
   - Set to "Full" or "Full (strict)"
   - SSL will be automatic and free!

5. **Update Your App**:
   - Update CORS settings in backend to allow your domain
   - Update frontend API URLs to use your domain

## Option 3: Let's Encrypt with Certbot (Self-Hosted)

**Best for**: VPS/dedicated servers, full control

### Prerequisites:
- Ubuntu/Debian server
- Domain name pointing to your server
- Ports 80 and 443 open

### Installation:

1. **Install Certbot**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   # Or for Apache:
   sudo apt install certbot python3-certbot-apache
   ```

2. **Get Certificate** (Nginx example):
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
   Certbot will:
   - Obtain certificate
   - Configure Nginx automatically
   - Set up auto-renewal

3. **Manual Certificate** (if not using Nginx/Apache):
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```
   Certificates saved to: `/etc/letsencrypt/live/yourdomain.com/`

4. **Configure Your Node.js Backend**:

   Install SSL support:
   ```bash
   cd backend
   npm install https fs
   ```

   Update `backend/src/index.js`:
   ```javascript
   import https from 'https';
   import fs from 'fs';
   import express from 'express';
   
   const app = express();
   
   // ... your existing app setup ...
   
   const options = {
     key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
     cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
   };
   
   https.createServer(options, app).listen(443, () => {
     console.log('HTTPS server running on port 443');
   });
   
   // Redirect HTTP to HTTPS
   app.use((req, res, next) => {
     if (req.secure) {
       next();
     } else {
       res.redirect(`https://${req.headers.host}${req.url}`);
     }
   });
   ```

5. **Auto-Renewal**:
   Certbot sets up a cron job automatically. Test renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

## Option 4: Using Docker with Traefik (Advanced)

**Best for**: Docker deployments, multiple services

1. **docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     traefik:
       image: traefik:v2.10
       command:
         - "--providers.docker=true"
         - "--entrypoints.web.address=:80"
         - "--entrypoints.websecure.address=:443"
         - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
         - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
         - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
         - ./letsencrypt:/letsencrypt
     
     backend:
       image: your-backend-image
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
         - "traefik.http.routers.backend.entrypoints=websecure"
         - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
     
     frontend:
       image: your-frontend-image
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
         - "traefik.http.routers.frontend.entrypoints=websecure"
         - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
   ```

## Option 5: Using Nginx Reverse Proxy

**Best for**: Existing Nginx setup, multiple apps

1. **Install Nginx**:
   ```bash
   sudo apt install nginx
   ```

2. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/snag-management`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # Frontend
       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/snag-management /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Updating Your Application for HTTPS

### Frontend Changes:

1. **Environment Variables** (`frontend/.env.production`):
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```

2. **Update API Service** (`frontend/src/services/api.js`):
   ```javascript
   const API = import.meta.env.VITE_API_URL || '/api';
   ```

3. **Build for Production**:
   ```bash
   cd frontend
   npm run build
   ```

### Backend Changes:

1. **CORS Configuration** (`backend/src/app.js`):
   ```javascript
   import cors from 'cors';
   
   app.use(cors({
     origin: [
       'https://yourdomain.com',
       'https://www.yourdomain.com'
     ],
     credentials: true
   }));
   ```

2. **Environment Variables** (`backend/.env`):
   ```
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   ```

## Testing HTTPS Setup

1. **Check SSL Certificate**:
   - Visit: https://www.ssllabs.com/ssltest/
   - Enter your domain
   - Should get A or A+ rating

2. **Test PWA Installation**:
   - Open site on mobile device
   - Should see "Install" prompt
   - Service worker should register

3. **Verify Service Worker**:
   - Open DevTools → Application → Service Workers
   - Should show "activated and running"

## Troubleshooting

### Certificate Not Trusted
- Ensure certificate is from Let's Encrypt or trusted CA
- Check certificate chain is complete
- Verify domain matches certificate

### Mixed Content Warnings
- Ensure all resources (images, APIs) use HTTPS
- Check for hardcoded `http://` URLs

### Service Worker Not Registering
- Must be on HTTPS (or localhost)
- Check browser console for errors
- Verify `sw.js` is accessible at root

### CORS Errors
- Update backend CORS to include your domain
- Check preflight requests are handled

## Recommended Setup for Your Use Case

**For Surveyors Using Mobile Phones:**

1. **Quick Start**: Use Vercel for frontend + Railway/Render for backend
   - Both provide HTTPS automatically
   - Free tiers available
   - Easy deployment

2. **Custom Domain**: Use Cloudflare
   - Free SSL
   - Easy DNS management
   - Good performance

3. **Self-Hosted**: Use Let's Encrypt + Nginx
   - Full control
   - Free SSL
   - Requires server management

## Next Steps

1. Choose your deployment option
2. Set up HTTPS using one of the methods above
3. Update environment variables
4. Test on mobile devices
5. Share the HTTPS URL with surveyors

Need help with a specific option? Let me know which approach you'd like to use!
