import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const srcDir = '/Users/victorbendas/Documents/GitHub/Sindicato/Assets/Presentation_workers';
const outDir = '/Users/victorbendas/Documents/GitHub/Sindicato/mainpage/public/images/presentation-workers';

const files = await readdir(srcDir);
const pngs = files.filter(f => f.endsWith('.png')).sort((a, b) => {
  const numA = parseInt(a.replace('.png', ''));
  const numB = parseInt(b.replace('.png', ''));
  return numA - numB;
});

console.log(`Found ${pngs.length} PNG files to convert`);

for (const file of pngs) {
  const src = join(srcDir, file);
  const name = file.replace('.png', '');
  const outWebp = join(outDir, `${name}.webp`);
  const outPng = join(outDir, file);

  // Convert to WebP (quality 82 for good balance)
  await sharp(src)
    .webp({ quality: 82, effort: 4 })
    .toFile(outWebp);

  // Copy original PNG
  await sharp(src)
    .png()
    .toFile(outPng);

  const webpSize = (await sharp(outWebp).metadata()).size || 0;
  const pngSize = (await sharp(outPng).metadata()).size || 0;
  console.log(`${file}: PNG ${(pngSize / 1024 / 1024).toFixed(1)}MB → WebP ${(webpSize / 1024 / 1024).toFixed(1)}MB (${Math.round((1 - webpSize / pngSize) * 100)}% smaller)`);
}

console.log('Done! All images converted.');
