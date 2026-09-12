#!/usr/bin/env node
// 统计稿子的句长/段长分布、模板句命中、素材复用率，给 human-writing.md 的硬指标做自检。
// 用法：node text-stats.mjs 稿子.md [--raw 素材.md] [--log]
//   --raw  用户口述/聊天记录/主播原话等人写的原始素材文件，计算正文里有多少字是从素材里原样搬过来的
//   --log  只输出一行摘要，贴进 references/detection-log.md

import { readFile } from 'node:fs/promises';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const rawIdx = argv.indexOf('--raw');
const rawFile = rawIdx >= 0 ? argv[rawIdx + 1] : null;
const logOnly = argv.includes('--log');

if (!file) {
  console.error('Usage: node text-stats.mjs <draft.md> [--raw <material.md>] [--log]');
  process.exit(2);
}

const stripTail = (t) => {
  // 末尾 --- 之后的交付说明不算正文，跟 zhuque-check.mjs 保持一致
  const hr = t.lastIndexOf('\n---');
  if (hr > 0) {
    const tail = t.slice(hr);
    if (tail.length < 1500 && /待审|未检测|授权|建议联系|来源：/.test(tail)) return t.slice(0, hr);
  }
  return t;
};

const stripMd = (t) =>
  stripTail(t)
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/^\s*[-*>]\s?/gm, '')
    .replace(/\*\*/g, '');

const text = stripMd(await readFile(file, 'utf8'));

const paragraphs = text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, '')).filter((p) => p.length > 0);
const sentences = paragraphs
  .flatMap((p) => p.split(/(?<=[。！？!?…])/))
  .map((s) => s.trim())
  .filter((s) => s.length >= 2);

const len = (arr) => arr.map((s) => s.length);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const std = (a) => {
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
};

const sl = len(sentences);
const pl = len(paragraphs);
const body = paragraphs.join('');
const total = body.length;

// 素材复用率：正文里每个字，如果落在一个与素材文件完全相同的 >=8 字片段里，就算"人写的字"。
let rawRatio = null;
if (rawFile) {
  const raw = stripMd(await readFile(rawFile, 'utf8')).replace(/\s+/g, '');
  const N = 8;
  const grams = new Set();
  for (let i = 0; i + N <= raw.length; i++) grams.add(raw.slice(i, i + N));
  const covered = new Uint8Array(total);
  for (let i = 0; i + N <= total; i++) {
    if (grams.has(body.slice(i, i + N))) for (let j = i; j < i + N; j++) covered[j] = 1;
  }
  rawRatio = covered.reduce((a, b) => a + b, 0) / total;
}

const patterns = [
  ['不是…而是…', /不是[^。，]{1,20}[，,]?而是/g],
  ['不仅…而且/更…', /不仅[^。]{1,20}(而且|更)/g],
  ['真正的X', /真正的[^。，]{1,10}(是|不是)/g],
  ['总结式收尾', /(总的来说|综上|说到底|归根结底|看下来我的感受是|两边都有道理|打法很清楚)/g],
  ['编号论证', /(第一|第二|第三|首先|其次|最后)[，,]/g],
  ['论文腔词', /(维度|解释力|含金量|样本量|统计角度|本质上|逻辑|层面|机制|能力)/g],
  ['表演性口语', /(说实话|讲真|你细品|你想想|我认)/g],
  ['正反方模板', /(有人认为|也有人说|支持.{1,6}的人|反对.{1,6}的人|另一种观点)/g],
  ['句首连接词', /(^|[。！？\n])(所以|因此|因为|但是|不过|其实|而且|同时|此外|另外|然而|于是|这时候|这也是)/g],
  ['解释句', /(这意味着|也就是说|换句话说|说明了|这说明|原因是|关键在于|问题在于|区别在于)/g],
  ['格言句', /[^。]{4,20}才是[^。]{2,12}[。]/g],
  ['破折号', /——/g],
  ['冒号解释', /：/g],
];

const hits = patterns.map(([name, re]) => [name, text.match(re) || []]);
const templateHits = hits.reduce((n, [, h]) => n + h.length, 0);

const particles = (text.match(/(吧|呢|啊|嘛|哈|诶|嗯|唉|呗|哦)[，。！？…]/g) || []).length;
const quotes = (text.match(/[“"「][^”"」]{2,}[”"」]/g) || []).length;
const straightQuotes = (text.match(/["']/g) || []).length;

const summary = [
  `字数 ${total}`,
  `句长std ${std(sl).toFixed(1)}`,
  `最长句 ${Math.max(...sl)}`,
  `段CV ${(std(pl) / mean(pl)).toFixed(2)}`,
  `最长段 ${Math.max(...pl)}`,
  `模板命中 ${templateHits}`,
  `直引号 ${straightQuotes}`,
  `语气词 ${particles}`,
  `引号原话 ${quotes}`,
  rawRatio === null ? '素材复用 未测' : `素材复用 ${(rawRatio * 100).toFixed(0)}%`,
].join(' | ');

if (logOnly) {
  console.log(summary);
  process.exit(0);
}

const ok = (cond) => (cond ? 'OK ' : 'FAIL');

console.log(`文件：${file}`);
console.log(`总字数：${total}  段落：${paragraphs.length}  句子：${sentences.length}\n`);

console.log('句长（字）');
console.log(`  均值 ${mean(sl).toFixed(1)}  标准差 ${std(sl).toFixed(1)}  最短 ${Math.min(...sl)}  最长 ${Math.max(...sl)}`);
console.log(`  ${ok(std(sl) >= 14)} 标准差 >= 14（AI 稿一般 6–10）`);
console.log(`  ${ok(Math.max(...sl) >= 50)} 最长句 >= 50`);
console.log(`  ${ok(sl.filter((x) => x <= 8).length >= 3)} 8 字以内碎句 >= 3 句（当前 ${sl.filter((x) => x <= 8).length}）`);
console.log(`  ${ok(sl.filter((x) => x >= 40).length >= 3)} 40 字以上长句 >= 3 句（当前 ${sl.filter((x) => x >= 40).length}）`);

console.log('\n段长（字）');
console.log(`  均值 ${mean(pl).toFixed(1)}  标准差 ${std(pl).toFixed(1)}  最短 ${Math.min(...pl)}  最长 ${Math.max(...pl)}`);
console.log(`  ${ok(std(pl) / mean(pl) >= 0.6)} 变异系数 >= 0.6（当前 ${(std(pl) / mean(pl)).toFixed(2)}）`);
console.log(`  ${ok(pl.filter((x) => x <= 25).length >= 2)} 一行段（<=25 字）>= 2 段（当前 ${pl.filter((x) => x <= 25).length}）`);
console.log(`  ${ok(Math.max(...pl) >= 180)} 最长段 >= 180 字`);

console.log('\n人味来源');
console.log(`  ${ok(straightQuotes === 0)} 英文直引号 " ' = 0（当前 ${straightQuotes}；朱雀实测直引号是强 AI 特征，跑 fix-quotes.mjs）`);
console.log(`  ${ok(particles >= 3)} 句尾语气词 >= 3 处（当前 ${particles}）`);
console.log(`  ---- 引号里的逐字原话 ${quotes} 处（原话揉进逗号长句里不加引号也行，v3 实测更好）`);
if (rawRatio === null) {
  console.log('  ---- 素材复用率未测：加 --raw 素材.md。');
} else {
  console.log(`  ---- 素材复用率 ${(rawRatio * 100).toFixed(0)}%（8 字以上原样片段；转写是短句，这个数会偏低，参考用，真正的闸门是 zhuque-check.mjs）`);
}

const openers = sentences.map((s) => s.slice(0, 2));
const dupOpen = Object.entries(openers.reduce((m, o) => ((m[o] = (m[o] || 0) + 1), m), {}))
  .filter(([, n]) => n >= 4)
  .sort((a, b) => b[1] - a[1]);
if (dupOpen.length) {
  console.log(`\n重复开头（>=4 次）：${dupOpen.map(([o, n]) => `"${o}"×${n}`).join('  ')}`);
}

console.log('\n模板句命中');
for (const [name, h] of hits) {
  if (h.length) console.log(`  ${name}: ${h.length}  例：${h.slice(0, 3).map((x) => x.replace(/^[。！？\n]/, '')).join(' / ')}`);
}
if (!templateHits) console.log('  无');

console.log('\n最短的 5 段：');
paragraphs
  .slice()
  .sort((a, b) => a.length - b.length)
  .slice(0, 5)
  .forEach((p) => console.log(`  [${p.length}] ${p.slice(0, 40)}`));

console.log(`\n日志行：${summary}`);
console.log('提醒：这是形状自检。过不过检测以 zhuque-check.mjs 为准（目标：人 100%，softmax < 0.1）。');
