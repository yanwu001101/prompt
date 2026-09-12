#!/usr/bin/env node
// 把稿子发给朱雀（腾讯 EdgeOne Makers 内置模型 @makers/zhuque-text）打 AI 率，逐段输出，最可疑的段排前面。
// 用法：node zhuque-check.mjs 稿子.md [--json 结果.json] [--log]
//   --json  把完整响应存下来（逐段标签、置信度）
//   --log   只输出一行摘要，贴进 references/detection-log.md
// 密钥：环境变量 ZHUQUE_API_KEY，或仓库根目录 .env 里的 ZHUQUE_API_KEY=...（.env 已 gitignore，不要提交）
// 额度：每月 50 万 token 免费，一篇 1000 字大约 1000 token 出头。别在循环里无脑刷。

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const jsonIdx = argv.indexOf('--json');
const jsonOut = jsonIdx >= 0 ? argv[jsonIdx + 1] : null;
const logOnly = argv.includes('--log');

if (!file) {
  console.error('Usage: node zhuque-check.mjs <draft.md> [--json out.json] [--log]');
  process.exit(2);
}

// 找 key：环境变量 > 从脚本目录往上找 .env > 从 cwd 往上找 .env
let key = process.env.ZHUQUE_API_KEY;
if (!key) {
  const starts = [dirname(fileURLToPath(import.meta.url)), process.cwd()];
  outer: for (const start of starts) {
    let dir = resolve(start);
    for (let i = 0; i < 6; i++) {
      const p = resolve(dir, '.env');
      if (existsSync(p)) {
        const m = (await readFile(p, 'utf8')).match(/^ZHUQUE_API_KEY=(.+)$/m);
        if (m) {
          key = m[1].trim();
          break outer;
        }
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
}
if (!key) {
  console.error('没找到 ZHUQUE_API_KEY。');
  console.error('配置方法：把仓库根目录的 .env.example 复制成 .env，填入 EdgeOne Makers 的 API Key（控制台 Makers -> Models -> API Key）。');
  console.error('没有 key 就没有分数，不要继续迭代改稿：把稿子标"未检测"交付，等用户配好 key 再测。');
  process.exit(3);
}

// 只测正文：去 frontmatter、图片、标题行、末尾来源行、分隔线
let text = await readFile(file, 'utf8');
// 末尾 --- 之后的交付说明（待审/来源/授权）不是可发布正文。它是模板化的公文腔，实测单独成块就是 0.5+，
// 留在里面会把整篇分数拖上去，还会挤走正文的分块边界。测之前切掉。
{
  const hr = text.lastIndexOf('\n---');
  if (hr > 0) {
    const tail = text.slice(hr);
    if (tail.length < 1500 && /待审|未检测|授权|建议联系|来源：/.test(tail)) text = text.slice(0, hr);
  }
}
text = text
  .replace(/^---[\s\S]*?---\s*/m, '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/^#+\s.*$/gm, '')
  .replace(/^\s*---+\s*$/gm, '')
  .replace(/^(赛制来源|图：|来源：|素材：)[^\n]*$/gm, '')
  .replace(/\*\*/g, '')
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter(Boolean)
  .join('\n\n');

const res = await fetch('https://ai-gateway.edgeone.link/v1/providers/zhuque-text/classify', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, is_merge: false }),
});
const body = await res.text();
let data;
try {
  data = JSON.parse(body);
} catch {
  console.error(`HTTP ${res.status}，返回不是 JSON：${body.slice(0, 300)}`);
  process.exit(1);
}
if (!res.ok || data.status !== 'success') {
  console.error(`HTTP ${res.status} status=${data.status} msg=${data.msg || ''}`);
  console.error(body.slice(0, 500));
  process.exit(1);
}

if (jsonOut) await writeFile(jsonOut, JSON.stringify(data, null, 2), 'utf8');

const pct = (x) => `${Math.round((x || 0) * 100)}%`;
const lr = data.labels_ratio || {};
const segs = (data.segment_labels || []).slice();
const labelName = { 0: '人', 1: 'AI', 2: '疑似' };

const summary = `朱雀 AI ${pct(lr['1'])} 疑似 ${pct(lr['2'])} 人 ${pct(lr['0'])} | softmax ${(data.softmax_confidence ?? 0).toFixed(3)} | 段 ${segs.length}，AI段 ${segs.filter((s) => s.label === 1).length} | 扣额度 ${data.makers_models_usage?.total_tokens ?? '?'} token`;

if (logOnly) {
  console.log(summary);
} else {
  console.log(`文件：${file}  正文 ${text.replace(/\s/g, '').length} 字`);
  console.log(summary);
  console.log('\n逐段（最像 AI 的排前面；label 1=AI 2=疑似 0=人）');
  segs
    .sort((a, b) => b.label - a.label || b.conf - a.conf)
    .forEach((s) => {
      const t = (s.text || '').replace(/\s+/g, ' ');
      console.log(`  [${labelName[s.label] ?? s.label}] conf ${(s.conf ?? 0).toFixed(3)}  #${s.order}  ${t.slice(0, 60)}${t.length > 60 ? '…' : ''}`);
    });

  console.log('\n日志行：' + summary);
  console.log('目标：人 100% 且 softmax < 0.1、每段 conf < 0.1。没到就把 conf 最高那块按 human-writing.md 的"口语串"写法重写，不要改词。');
}
