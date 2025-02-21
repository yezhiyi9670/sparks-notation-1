<img src="packages/desktop/logo/logo.png" align="right" width="128" height="128"/>

# Sparks NMN

**简体中文** | [English](./README-en.md)

使用文本高效地编写简谱！

[官方网站](https://notation.sparkslab.art/) · [例子 & 在线试玩](https://notation.sparkslab.art/examples) · [赞助](https://notation.sparkslab.art/donate/)

讨论中的设计方案：[广义 TAB 记谱法（吉他谱）](./_v2-designs/version-2/tab-notation.md) · [新的排版方案](./_v2-designs/version-2/bounding-box-layout.md)

> 由于数字简谱在英语国家中似乎并不常用，此项目还没有将英语添加为显示语言的计划（但是有英文歌词的支持）。

Sparks NMN 是一个基于文本的简谱（Numbered Music Notation）制作语言，其设计灵感和语法经过长期实践而形成，具有简洁、自然、易读且高效的特点。

```plain
P: 1=C 4/4
Rp: font_lyrics=Roman,CommonSerif/600/0.95
===
N: X X (XX) X | (XX) (XX) X 0 | (XX) (XX) (XX) X | (XX) (XX) X 0 |
Lc[1.]: 门前大桥下，游过一群鸭。快来快来数一数，二四六七八。
---
N: &lpr; (1e.(1e)) (55) (36) (53) | (21) (23) 1 - &rpr; |
---
N: ||: 3 1 (33) 1 | (33) (56) 5 - | (66) (65) (44) 4 | (23) (21) 2 - |
Lc[1.]: 门前大桥下，游过一群鸭。快来快来数一数，二四六七八。
Lc[2.]: 赶鸭老爷爷，胡子白花花。唱呀唱着家乡戏，还会说笑话。
---
N: 3 (10) 3 (10) | (33) (56) 6 - | 1e (55) 6 3 | (2^1^) (2^3^) 5 - | 1e (55) 6 3 | (2^1^) (2^3^) 1 - :||
Lc[1.]: 咕嘎咕嘎，真呀真多鸭，数不清到底多%少%鸭，数不清到底多%少%鸭。
Lc[2.]: 小孩小孩，快快上学校，别考个鸭蛋抱%回%家，别考个鸭蛋抱%回%家。
```

Sparks NMN 的核心基于 Web 技术，可以在浏览器中运行，在线试用版本就是这么这样实现的。桌面应用版，自然就是用 Electron 技术实现的。毫无疑问，安装后你的电脑上将再多出一个 Chromium 内核。

此仓库包含内核、桌面应用和网站。

## 构建说明

此仓库是多个模块的 workspace，使用 yarn berry 进行管理，但是为避免过多配置问题没有采用 PnP。

仓库内没有将 Sparks NMN 核心单独打包成 JS 的功能，但是你可以像此项目中一样直接引用其源代码。

### 网页 Demo `packages/demo`

（同时用于测试核心功能）

- 开发：`yarn dev`
- 构建：`yarn build`，输出到 `dist/`
- 预览构建结果：`yarn preview`

### 导出模板 `packages/static-resources`

- 生成导出模板：`yarn build-wrapper`

### 桌面版 `packages/desktop`

先决条件：生成导出模板。桌面版的测试/构建步骤执行前会自动复制导出模板的构建输出。

- 开发：`yarn dev`
- 构建：`yarn package`
- 构建到 zip：`yarn make`

### 网站 `packages/website`

- 先决条件：构建网页 Demo，并在此处运行 `yarn presync` 复制构建结果。
- 开发：`yarn start`
- 构建：`yarn build`
- 预览构建结果：`yarn serve`
