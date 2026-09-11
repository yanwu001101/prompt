# 三角洲行动公众号提示词

《三角洲行动》微信公众号写作相关的 skill 提示词仓库。包含赛事复盘、争议选题、去 AI 味三套工作流。

## 目录

```
skills/
  delta-force-wechat-writer/   三角洲公众号写手（主 skill）
    SKILL.md                   入口：读什么、工作流、不能碰的
    references/
      human-writing.md         怎么写才像人写的（核心：用户素材 ≥40%，形状指标，禁令）
      detection-log.md         每篇朱雀分数 + 统计行，用来校准阈值
      editorial-memory.md      编辑记忆与反馈沉淀
      topic-selection.md       争议性选题（只用于选题，不进正文）
      tactical-writing.md      战术与赛事写作规范
      source-verification.md   事实与素材核验
      visual-production.md     真实配图与去水印规范
    scripts/
      zhuque-check.mjs         朱雀 API 打分（闸门：人 100%、softmax < 0.1）
      fix-quotes.mjs           直引号换中文弯引号（朱雀实测直引号是强 AI 特征）
      text-stats.mjs           句长/段长/模板句/素材复用率自检（参考）
      fetch-video-text.mjs     拉 B 站弹幕/字幕当素材
      transcribe.py            faster-whisper 转写视频音频（主播原话）
      embed-markdown-images.mjs  Base64 单文件版生成
  remove-ai-flavor/            去 AI 味（中文公众号向）
    SKILL.md
    references/anti-ai-flavor-rules.md
  humanizer-voice/             人味写作（spuvr/humanizer）
    SKILL.md
  humanizer-patterns/          25 条 AI 痕迹模式（blader/humanizer）
    SKILL.md
examples/
  主播巅峰赛冠军与职业选手-赛制分析稿.md
```

## 安装

### MiMo Desktop / MiMoCode

把 `skills/` 下需要的目录复制到：

- 项目级：`<project>/.mimocode/skills/<skill-name>/`
- 全局：`~/.config/mimocode/skills/<skill-name>/`

新会话生效。

### 朱雀 API 密钥

仓库根目录建 `.env`（已 gitignore）：

```
ZHUQUE_API_KEY=sk-...
```

在 EdgeOne 控制台 Makers → Models → API Key 创建；内置模型 `@makers/zhuque-text`，每月 50 万 token 免费。

### Claude Code

```bash
cp -r skills/delta-force-wechat-writer ~/.claude/skills/
cp -r skills/remove-ai-flavor ~/.claude/skills/
cp -r skills/humanizer-voice ~/.claude/skills/
cp -r skills/humanizer-patterns ~/.claude/skills/
```

## 使用

### 写一篇赛事稿

1. 加载 `delta-force-wechat-writer`
2. 向用户要素材：他自己的口述（语音转文字，不改字）、聊天记录、主播逐字原话。没有不开工
3. 查证近期赛事与版本（官方页优先）
4. 按 `human-writing.md` 写：用户的话原样摆，模型只补数字和衔接；不要 A/B 对比论文骨架
5. `node scripts/fix-quotes.mjs 稿子.md`，再 `node scripts/zhuque-check.mjs 稿子.md`；没到"人 100%、softmax < 0.1"就重写 conf 最高那块，最多 4 轮
6. 配真实局内帧（有 HUD），平台水印用 OpenCV TELEA 无痕去掉
7. 交付源稿 + Base64 单文件版
8. 每版分数记进 `detection-log.md`

`remove-ai-flavor` / `humanizer-*` 只作写完后的参照，不要拿来对 AI 稿反复改写（改一遍分高一次）。

### 去 AI 味

```
Humanize this text:
[粘贴正文]
```

或直接说「去 AI 味」「不像 AI 写的」。

## 关键规则（已沉淀进 skill）

- 过朱雀实测两个主因：英文直引号 `"`（换 `“”`）和"一句一引号 + 记者式串词"（改成原话揉进口语长句）；删对称、砍套话无效
- 素材先拉视频转写和弹幕，原话要多；在 AI 稿上反复"去味"只会越改越高
- 宣传图 ≠ 局内图；局内图必须有 HUD
- 平台水印要去，赛事 UI 要留；mask 限定 x<250，不碰指南针
- 不要写成 A观点/B观点/作者判断 的对比论文
- 不用 not-X-but-Y、一锤定音收束句、假三连、破折号
- 地图名必须核对，不能凭画面猜
- 真实素材硬规则：禁止 AI 生成冒充比赛画面

## 示例

`examples/` 下是主播巅峰赛赛制分析的样稿，含5张去水印局内帧引用。注意：这篇是纯模型生成的，朱雀检测八轮都没过，留着当反面样本和 `text-stats.mjs` 的测试输入，不要照它的写法写。

## 来源

- remove-ai-flavor: [chujianyun/skills](https://github.com/chujianyun/skills)
- humanizer-voice: [spuvr/humanizer](https://github.com/spuvr/humanizer)
- humanizer-patterns: [blader/humanizer](https://github.com/blader/humanizer)

## License

提示词按各自上游 License。delta-force-wechat-writer 为项目自用。
