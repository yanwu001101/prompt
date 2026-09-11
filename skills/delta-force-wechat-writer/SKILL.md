---
name: delta-force-wechat-writer
description: 为中文微信公众号《三角洲行动观察室》写赛事复盘、主播赛观察、战术转译、版本体验稿。用真实比赛帧和游戏内截图做证据，按"人写稿"的流程出稿，目标是过朱雀等中文 AI 检测并且真的像一个看直播的人写的。当用户提到三角洲行动、DFPL、主播巅峰赛、烽火地带、全面战场、公众号稿、复盘稿、去 AI 味改稿时使用。
---

# 三角洲行动公众号写手

## 先读什么

每次开工按顺序读：

1. `references/editorial-memory.md`：用户偏好和历史踩坑，只看"当前有效规则"。
2. `references/human-writing.md`：怎么写才像人写的。这是核心，写之前和写完都要对照。
3. 按需读：`topic-selection.md`（选题）、`tactical-writing.md`（模式和体裁规范）、`source-verification.md`（事实核验）、`visual-production.md`（配图和去水印）、`detection-log.md`（历次朱雀分数、对照实验）。

## 工作流

```text
- [ ] 1 选题：用 topic-selection.md 判断值不值得写；选题表只在草稿区，不进正文
- [ ] 2 拉素材：node scripts/fetch-video-text.mjs BV号 输出目录（弹幕不用登录；字幕要 --cookies-from-browser，浏览器开着会锁库）
        没字幕就 yt-dlp -f <m4a格式号> 下音频，python scripts/transcribe.py audio.m4a（faster-whisper，12 分钟视频 CPU 几分钟）
        再向用户要他自己的口述；转写和口述都没有不开工
- [ ] 3 查证：赛制、版本、地图、选手、日期，官方页优先（source-verification.md）
- [ ] 4 素材单：转写 + 弹幕 + 用户原文 + 时间点、UI 数字；另存 素材.md（human-writing.md）
- [ ] 5 一口气写：原话揉进逗号长句不一句一引号，夹真实碎念，不写记者式串词、解释句、金句
- [ ] 6 node scripts/fix-quotes.mjs 稿子.md（直引号换弯引号，必做）
- [ ] 7 node scripts/zhuque-check.mjs 稿子.md --json 朱雀-vN.json；目标 人 100%、softmax < 0.1、每段 < 0.1
        没到：conf 最高那块按"口语串"整块重写，另存 vN+1，再测；最多 4 轮
        脚本报"没找到 ZHUQUE_API_KEY"：停。不要凭感觉改稿迭代，把稿子标"未检测"交付，告诉用户把 .env.example 复制成 .env 填 key 后再测
- [ ] 8 node scripts/text-stats.mjs 稿子.md --raw 素材.md 看形状（参考，不是闸门）
- [ ] 9 配图：真实局内帧（带 HUD），去平台水印留赛事 UI（visual-production.md）
- [ ] 10 交付源稿 + node scripts/embed-markdown-images.mjs 生成单文件版；标"待审"；列出所有"我"的反应句让用户确认
- [ ] 11 每版的两行 --log 记进 detection-log.md；用户反馈写回 editorial-memory.md
```

## 几条不能碰的

- 不生成、不重绘、不用相似画面冒充比赛画面。宣传图不算局内图。
- 原话必须逐字，个人经历必须真实（没有就向用户要），数字必须核对。
- 导播透视和解说信息不当成选手当时知道的信息。
- 多帧按游戏内计时器排序，不按视频播放顺序。
- 未经授权不发布，不宣称图片可商用。

## 关于 AI 检测

朱雀 API 已接入（`scripts/zhuque-check.mjs`，密钥在仓库根 `.env` 的 `ZHUQUE_API_KEY`，已 gitignore，模板是 `.env.example`；每月 50 万 token 免费，一篇约 2000）。不用再让用户手动贴网页。**没配 key 就没有分数，此时不做任何"去 AI 味"迭代**：前八轮证明没有分数的改稿只会越改越差。稿子标"未检测"交付，等 key。

2026-09-12 实测（详见 human-writing.md 开头）：前八轮 100% 的主因有两个，一是英文直引号 `"`（同一段文字换成 `“”` 就从疑似变人），二是"一句一引号 + 记者式串词"的格式。改成原话揉进口语长句、夹真实碎念，整篇从 softmax 0.577 降到 0.045，和纯人写文本一个水平。删对称结构、砍套话这类做法实测无效。

`remove-ai-flavor`、`humanizer-voice`、`humanizer-patterns` 三个 skill 只作为写完后的补充参照，不要拿它们对 AI 稿做第三遍改写。
