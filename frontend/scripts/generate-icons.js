// Simple script to generate PWA icons
// Run with: node scripts/generate-icons.js
// Requires: npm install canvas (or use the HTML generator instead)

const fs = require('fs');
const path = require('path');

// For now, create a simple SVG-based solution
// Users can convert SVG to PNG using online tools or ImageMagick

const icon192Svg = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#3b82f6"/>
  <g transform="translate(96, 96)">
    <rect x="-12" y="-30" width="24" height="48" fill="#ffffff" rx="2"/>
    <rect x="-4" y="18" width="8" height="16" fill="#ffffff"/>
    <circle cx="0" cy="36" r="12" fill="#ffffff"/>
  </g>
</svg>`;

const icon512Svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6"/>
  <g transform="translate(256, 256)">
    <rect x="-32" y="-80" width="64" height="128" fill="#ffffff" rx="6"/>
    <rect x="-12" y="48" width="24" height="42" fill="#ffffff"/>
    <circle cx="0" cy="96" r="32" fill="#ffffff"/>
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

// Create SVG files (can be converted to PNG)
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192Svg);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512Svg);

console.log('SVG icons created!');
console.log('To create PNG icons:');
console.log('1. Open generate-icons.html in a browser and download the PNGs');
console.log('2. Or use an online SVG to PNG converter');
console.log('3. Or use ImageMagick: convert icon-192.svg -resize 192x192 icon-192.png');
