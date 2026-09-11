#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) {
  console.error('Usage: node embed-markdown-images.mjs <input.md> [output.md]');
  process.exit(2);
}

const input = path.resolve(inputArg);
const parsed = path.parse(input);
const output = outputArg
  ? path.resolve(outputArg)
  : path.join(parsed.dir, `${parsed.name}-单文件版${parsed.ext}`);
const markdown = await readFile(input, 'utf8');
const mimeByExt = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
]);

const imagePattern = /!\[([^\]]*)\]\(([^)\n]+)\)/g;
const replacements = [];
let localImages = 0;

for (const match of markdown.matchAll(imagePattern)) {
  const rawSource = match[2].trim().replace(/^<|>$/g, '');
  if (/^(?:https?:|data:|lazyant-asset:)/i.test(rawSource)) continue;
  localImages += 1;
  const imagePath = path.resolve(path.dirname(input), rawSource);
  const mime = mimeByExt.get(path.extname(imagePath).toLowerCase());
  if (!mime) throw new Error(`Unsupported image type: ${rawSource}`);
  const base64 = (await readFile(imagePath)).toString('base64');
  const replacement = `![${match[1]}](data:${mime};base64,${base64})`;
  replacements.push({ start: match.index, end: match.index + match[0].length, replacement });
}

let result = markdown;
for (const item of replacements.reverse()) {
  result = result.slice(0, item.start) + item.replacement + result.slice(item.end);
}

const embedded = [...result.matchAll(/!\[[^\]]*\]\(data:image\/[a-zA-Z0-9.+-]+;base64,/g)].length;
if (replacements.length !== localImages) {
  throw new Error(`Embedding mismatch: found ${localImages} local images, replaced ${replacements.length}`);
}

await writeFile(output, result, 'utf8');
console.log(JSON.stringify({ input, output, localImages, embeddedAdded: replacements.length, embeddedTotal: embedded, bytes: Buffer.byteLength(result) }));

