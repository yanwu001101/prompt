# 三角洲行动公众号提示词

《三角洲行动》微信公众号写作相关的 skill 提示词仓库。包含赛事复盘、争议选题、去 AI 味三套工作流。

## 目录

```
skills/
  delta-force-wechat-writer/   三角洲公众号写手（主 skill）
    SKILL.md                   争议性选题系统
    references/
      editorial-memory.md      编辑记忆与反馈沉淀
      tactical-writing.md      战术与赛事写作规范
      source-verification.md   事实与素材核验
      visual-production.md     真实配图与去水印规范
    scripts/
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

### Claude Code

```bash
cp -r skills/delta-force-wechat-writer ~/.claude/skills/
cp -r skills/remove-ai-flavor ~/.claude/skills/
cp -r skills/humanizer-voice ~/.claude/skills/
cp -r skills/humanizer-patterns ~/.claude/skills/
```

## 使用

### 写一篇赛事争议稿

1. 加载 `delta-force-wechat-writer`
2. 查证近期赛事与版本（官方页优先）
3. 按「一个瞬间 + 由此引出的问题」组织，不要 A/B 对比论文骨架
4. 配真实局内帧（有 HUD），平台水印用 OpenCV TELEA 无痕去掉
5. 用 `remove-ai-flavor` + `humanizer-voice` + `humanizer-patterns` 自检
6. 交付源稿 + Base64 单文件版

### 去 AI 味

```
Humanize this text:
[粘贴正文]
```

或直接说「去 AI 味」「不像 AI 写的」。

## 关键规则（已沉淀进 skill）

- 宣传图 ≠ 局内图；局内图必须有 HUD
- 平台水印要去，赛事 UI 要留；mask 限定 x<250，不碰指南针
- 不要写成 A观点/B观点/作者判断 的对比论文
- 不用 not-X-but-Y、一锤定音收束句、假三连、破折号
- 地图名必须核对，不能凭画面猜
- 真实素材硬规则：禁止 AI 生成冒充比赛画面

## 示例

`examples/` 下是按上述流程产出的样稿（主播巅峰赛赛制分析），含5张去水印局内帧引用。

## 来源

- remove-ai-flavor: [chujianyun/skills](https://github.com/chujianyun/skills)
- humanizer-voice: [spuvr/humanizer](https://github.com/spuvr/humanizer)
- humanizer-patterns: [blader/humanizer](https://github.com/blader/humanizer)

## License

提示词按各自上游 License。delta-force-wechat-writer 为项目自用。
