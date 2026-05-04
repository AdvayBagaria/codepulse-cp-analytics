import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svgPath = path.join(root, 'public', 'icons', 'icon-source.svg');
const out192 = path.join(root, 'public', 'icons', 'icon-192.png');
const out512 = path.join(root, 'public', 'icons', 'icon-512.png');

const svg = await fs.readFile(svgPath);

await sharp(svg).resize(192, 192).png().toFile(out192);
await sharp(svg).resize(512, 512).png().toFile(out512);

console.log('Icons generated:', out192, out512);
