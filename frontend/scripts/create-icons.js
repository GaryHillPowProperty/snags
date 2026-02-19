// Script to create PWA icons
// Run with: node scripts/create-icons.js
// Requires: npm install canvas (will install automatically if missing)

const fs = require('fs');
const path = require('path');

async function createIcons() {
  let canvas;
  try {
    // Try to use canvas package
    canvas = require('canvas');
  } catch (err) {
    console.log('Installing canvas package...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install canvas --save-dev', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      canvas = require('canvas');
    } catch (installErr) {
      console.error('Failed to install canvas. Using fallback method...');
      return createIconsFallback();
    }
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const sizes = [192, 512];

  for (const size of sizes) {
    const img = canvas.createCanvas(size, size);
    const ctx = img.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw microphone icon
    const centerX = size / 2;
    const centerY = size / 2;
    const micWidth = size * 0.15;
    const micHeight = size * 0.4;
    const standWidth = size * 0.05;
    const standHeight = size * 0.15;
    const baseRadius = size * 0.08;

    // Microphone body (rounded rectangle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const cornerRadius = size * 0.02;
    ctx.roundRect(
      centerX - micWidth / 2,
      centerY - micHeight / 2,
      micWidth,
      micHeight,
      cornerRadius
    );
    ctx.fill();

    // Microphone stand
    ctx.fillRect(
      centerX - standWidth / 2,
      centerY + micHeight / 2,
      standWidth,
      standHeight
    );

    // Microphone base (circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY + micHeight / 2 + standHeight + baseRadius, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add a subtle shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = size * 0.02;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = size * 0.01;

    // Save as PNG
    const buffer = img.toBuffer('image/png');
    const filename = `icon-${size}.png`;
    const filepath = path.join(publicDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Created ${filename} (${size}x${size})`);
  }

  console.log('\n✅ Icons created successfully!');
}

function createIconsFallback() {
  console.log('\n📝 Fallback: Creating SVG icons that can be converted to PNG');
  console.log('You can convert them using:');
  console.log('  - Online tool: https://cloudconvert.com/svg-to-png');
  console.log('  - ImageMagick: convert icon-192.svg icon-192.png');
  console.log('  - Or use the generate-icons.html file in public folder\n');

  const publicDir = path.join(__dirname, '..', 'public');

  const icon192Svg = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="url(#bg)"/>
  <g transform="translate(96, 96)">
    <rect x="-14" y="-38" width="28" height="76" fill="#ffffff" rx="4"/>
    <rect x="-5" y="38" width="10" height="20" fill="#ffffff"/>
    <circle cx="0" cy="66" r="15" fill="#ffffff"/>
  </g>
</svg>`;

  const icon512Svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg2)"/>
  <g transform="translate(256, 256)">
    <rect x="-38" y="-102" width="76" height="204" fill="#ffffff" rx="10"/>
    <rect x="-13" y="102" width="26" height="54" fill="#ffffff"/>
    <circle cx="0" cy="176" r="40" fill="#ffffff"/>
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192Svg);
  fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512Svg);
  console.log('✓ Created icon-192.svg');
  console.log('✓ Created icon-512.svg');
}

// Run the script
createIcons().catch(err => {
  console.error('Error:', err.message);
  createIconsFallback();
});
