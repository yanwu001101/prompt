#!/usr/bin/env python
# 用 faster-whisper 把视频音频转成带时间戳的文本，当主播原话素材用。
# 用法：python transcribe.py audio.m4a [输出.txt] [--model small|medium|large-v3]
# 依赖：pip install faster-whisper（自带解码器，不需要系统 ffmpeg）。第一次跑会下模型。

import sys
from pathlib import Path

from faster_whisper import WhisperModel

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args:
    print("Usage: python transcribe.py <audio> [out.txt] [--model small]")
    sys.exit(2)

audio = Path(args[0])
out = Path(args[1]) if len(args) > 1 else audio.with_suffix(".转写.txt")
model_name = "small"
if "--model" in sys.argv:
    model_name = sys.argv[sys.argv.index("--model") + 1]

model = WhisperModel(model_name, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    str(audio),
    language="zh",
    vad_filter=True,
    initial_prompt="三角洲行动，烽火地带，主播巅峰赛，老飞宇，杰克，撤离，曼德尔砖，大坝，航天基地，巴克什，血氧仪。",
)

lines = []
for s in segments:
    m, sec = divmod(int(s.start), 60)
    lines.append(f"[{m:02d}:{sec:02d}] {s.text.strip()}")
    print(lines[-1], flush=True)

out.write_text("\n".join(lines), encoding="utf-8")
print(f"\n{len(lines)} 段 -> {out}")
print("提醒：whisper 会把口语写成书面语、吞掉语气词和脏话。引用前对着视频听一遍，按原样改回来。")
