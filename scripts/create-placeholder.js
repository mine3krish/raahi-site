const sharp = require('sharp');

// Create a placeholder image
const width = 1200;
const height = 900;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">
    Property Image
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.8)" text-anchor="middle">
    Coming Soon
  </text>
  <g transform="translate(${width/2 - 60}, ${height/2 + 80})">
    <rect x="0" y="0" width="120" height="80" rx="4" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="3"/>
    <rect x="10" y="10" width="40" height="40" rx="20" fill="rgba(255,255,255,0.3)"/>
    <polygon points="25,20 25,30 33,25" fill="white"/>
    <line x1="60" y1="20" x2="110" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"/>
    <line x1="60" y1="30" x2="100" y2="30" stroke="white" stroke-width="3" stroke-linecap="round"/>
    <line x1="10" y1="60" x2="110" y2="60" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="70" x2="90" y2="70" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>
`;

const outputPath = '/var/www/cdn/placeholder.jpg';

sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile(outputPath)
  .then(() => {
    console.log('✓ Placeholder image created successfully at:', outputPath);
    console.log('✓ Accessible at: https://raahiauctions.cloud/cdn/placeholder.jpg');
  })
  .catch(err => {
    console.error('Error creating placeholder:', err);
    process.exit(1);
  });
