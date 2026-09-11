#!/usr/bin/env node
// 拉 B 站视频的弹幕（不用登录）和字幕（需要浏览器 cookie），整理成按时间排序的文本，当人写素材用。
// 用法：node fetch-video-text.mjs <BV号或URL> [输出目录] [--cookies-from-browser chrome|edge|firefox]
// 依赖：yt-dlp 在 PATH 里。

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const target = argv.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('Usage: node fetch-video-text.mjs <BV号或URL> [outDir] [--cookies-from-browser chrome]');
  process.exit(2);
}
const outDir = argv.filter((a) => !a.startsWith('--'))[1] || 'video-text';
const cbIdx = argv.indexOf('--cookies-from-browser');
const cookieArgs = cbIdx >= 0 ? ['--cookies-from-browser', argv[cbIdx + 1]] : [];
const url = /^BV/i.test(target) ? `https://www.bilibili.com/video/${target}` : target;

mkdirSync(outDir, { recursive: true });

const run = (args) => {
  const r = spawnSync('yt-dlp', args, { encoding: 'utf8' });
  if (r.error) {
    console.error('yt-dlp 没装或不在 PATH：', r.error.message);
    process.exit(1);
  }
  return r;
};

// 弹幕 + 字幕（字幕没 cookie 时会跳过，只有 warning）
run(['--skip-download', '--write-subs', '--sub-langs', 'all', '-o', join(outDir, '%(id)s.%(ext)s'), ...cookieArgs, url]);

const files = readdirSync(outDir);
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

for (const f of files.filter((x) => x.endsWith('.danmaku.xml'))) {
  const xml = readFileSync(join(outDir, f), 'utf8');
  const items = [];
  for (const m of xml.matchAll(/<d p="([^"]+)">([^<]*)<\/d>/g)) {
    const t = parseFloat(m[1].split(',')[0]);
    items.push([t, m[2].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')]);
  }
  items.sort((a, b) => a[0] - b[0]);
  const out = items.map(([t, s]) => `[${fmt(t)}] ${s}`).join('\n');
  const outFile = join(outDir, f.replace(/\.danmaku\.xml$/, '.弹幕.txt'));
  writeFileSync(outFile, out, 'utf8');
  console.log(`弹幕 ${items.length} 条 -> ${outFile}`);

  // 刷得最多的弹幕，写稿时直接引用
  const freq = {};
  for (const [, s] of items) freq[s] = (freq[s] || 0) + 1;
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log('刷得最多的：');
  for (const [s, n] of top) console.log(`  ×${n}  ${s}`);
}

for (const f of files.filter((x) => /\.(srt|vtt|json3)$/.test(x) && !x.includes('danmaku'))) {
  console.log(`字幕文件 -> ${join(outDir, f)}（这是主播原话，逐字引用）`);
}

if (!files.some((x) => /\.(srt|vtt|json3)$/.test(x) && !x.includes('danmaku'))) {
  console.log('\n没拿到字幕：B 站字幕要登录。加 --cookies-from-browser edge（或 chrome）重跑。');
  console.log('没有字幕的视频，用下面两步本地转写：');
  console.log('  yt-dlp -x --audio-format m4a -o audio.m4a ' + url);
  console.log('  faster-whisper（需要 pip install faster-whisper 和 ffmpeg）转写成带时间戳的 txt');
}
