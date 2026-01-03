const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgBuffer = fs.readFileSync('icon.svg');

  const sizes = [16, 32, 48, 128];

  console.log('Generating PNG icons from SVG...');

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`icon-${size}.png`);

    console.log(`✓ Generated icon-${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);