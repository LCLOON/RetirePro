// Script to generate all favicon and icon sizes from a base SVG
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = './public';

// Create a professional favicon SVG (emerald money bag icon)
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#059669"/>
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)"/>
  <!-- Dollar sign -->
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">$</text>
</svg>
`;

// OG Image SVG (1200x630)
const ogImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#14b8a6"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  
  <!-- Accent line at top -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#accentGrad)"/>
  
  <!-- Logo circle -->
  <circle cx="150" cy="315" r="80" fill="url(#accentGrad)"/>
  <text x="150" y="355" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">$</text>
  
  <!-- Brand name -->
  <text x="280" y="290" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">RetirePro</text>
  
  <!-- Tagline -->
  <text x="280" y="360" font-family="Arial, sans-serif" font-size="32" fill="#94a3b8">Free Retirement Planning Calculator</text>
  
  <!-- Features -->
  <text x="280" y="440" font-family="Arial, sans-serif" font-size="24" fill="#10b981">✓ Monte Carlo Simulations</text>
  <text x="600" y="440" font-family="Arial, sans-serif" font-size="24" fill="#10b981">✓ Social Security Optimizer</text>
  <text x="280" y="480" font-family="Arial, sans-serif" font-size="24" fill="#10b981">✓ AI-Powered Insights</text>
  <text x="600" y="480" font-family="Arial, sans-serif" font-size="24" fill="#10b981">✓ Tax Planning Tools</text>
  
  <!-- URL -->
  <text x="280" y="560" font-family="Arial, sans-serif" font-size="28" fill="#64748b">retirepro.io</text>
  
  <!-- Decorative elements -->
  <circle cx="1100" cy="100" r="150" fill="#10b981" opacity="0.1"/>
  <circle cx="1050" cy="550" r="100" fill="#10b981" opacity="0.1"/>
</svg>
`;

async function generateIcons() {
  console.log('Generating icons and favicons...\n');

  // Save base SVG
  const svgPath = path.join(PUBLIC_DIR, 'icon.svg');
  fs.writeFileSync(svgPath, faviconSvg.trim());
  console.log('✓ Created icon.svg');

  // Icon sizes needed
  const iconSizes = [16, 32, 72, 96, 128, 192, 384, 512];
  
  // Generate PNG icons
  for (const size of iconSizes) {
    const outputPath = size <= 32 
      ? path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`)
      : path.join(PUBLIC_DIR, `icon-${size}.png`);
    
    await sharp(Buffer.from(faviconSvg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Created ${path.basename(outputPath)}`);
  }

  // Generate apple-touch-icon (180x180)
  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // Generate favicon.ico (multi-size ICO is complex, use 32x32 PNG as base)
  await sharp(Buffer.from(faviconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  // Generate OG image (1200x630)
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log('✓ Created og-image.png');

  // Generate Twitter image (same as OG)
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'twitter-image.png'));
  console.log('✓ Created twitter-image.png');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
