#!/usr/bin/env node
// 把正文里的英文直引号 " 成对换成中文弯引号 “ ”，单引号 ' 换成 ‘ ’。朱雀实测：直引号是强 AI 特征。
// 用法：node fix-quotes.mjs 稿子.md [输出.md]   不给输出就原地改
import { readFile, writeFile } from 'node:fs/promises';
const [inFile, outFile] = process.argv.slice(2);
if (!inFile) { console.error('Usage: node fix-quotes.mjs <draft.md> [out.md]'); process.exit(2); }
let s = await readFile(inFile, 'utf8');
let d = 0, q = 0;
s = s.split('\n').map((line) => {
  if (/^\s*(```|!\[|\[|\||#)/.test(line)) return line; // 代码块、图片、链接行、表格、标题不动
  let open = true, out = '';
  for (const ch of line) {
    if (ch === '"') { out += open ? '“' : '”'; open = !open; d++; }
    else if (ch === "'") { out += open ? '‘' : '’'; open = !open; q++; }
    else out += ch;
  }
  return out;
}).join('\n');
await writeFile(outFile || inFile, s, 'utf8');
console.log(`换了 ${d} 个双引号、${q} 个单引号 -> ${outFile || inFile}`);
