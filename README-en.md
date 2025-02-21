<img src="packages/desktop/logo/logo.png" align="right" width="128" height="128"/>

# Sparks NMN

[简体中文](./README-en.md) | **English**

Compose Number Music Notation in text format efficiently!

[Website](https://notation.sparkslab.art/) · [Examples & Playground](https://notation.sparkslab.art/examples) · [Sponsor](https://notation.sparkslab.art/donate/)

> Since Numbered Music Notation is seemingly not commonly used in English regions, this project does not plan adding English as a display language right now.

Sparks NMN is a text-based language for composing Number Music Notation scores. Based on practical experience, it features simple and natural syntax. Also readability and high efficiency.

```plain
P: 1=bB 4/4 qpm=120
Rp: page=A4 font_lyrics=Roman,CommonSerif/600
====
N: 1. (2)3. (1) | 3 1 3 0 | 2. (3)(44)(32) | 4 - - 0 |
Lw: Do, a deer, a fe-male deer. Re, a drop of gol-den sun.
---
N: 3. (4)5. (3) | 5 3 5 0 | 4. (5)(66)(54) | 6 - - 0 |
Lw: Mi, a name I call my-self. Fa, a long long way to run.
---
N: 5. (1)(23)(45) | 6 - - 0 | 6. (2)(3#4)(56) | 7 - - 0 |
Lw: Sol, a nee-dle pul-ling thread. La, a note to fol-low sol.
---
N: /{w=1.1} 7. (3)(#4#5)(67) |{w=0.9} 1e - 0 (7b7) |
Lw: Ti, a drink with jam and bread, that will
---
N: 6 4 7 5 |{w=0.85} 1e - - 0 |{w=1.15} (01)(23)(45)(67) | 1e[str] 5[str] 1e[str] 0 |||
Lw: lead us back to Do. Do Re Mi Fa Sol La Ti Do Sol Do!
```

Sparks NMN's core is web-based and can run in the browser. This is how the online trial version works. Hence, the desktop app is built with Electron. Undoubtedly, your PC will get another Chromium kernel if you install it.

This repository contains the core, the desktop application and the website together.

## Building & Integration Instructions

This is a multi-package workspace, managed using yarn berry. However, due to many compatibility problems, PnP is not used.

The repository currently does not contain the pipeline to package the Sparks NMN core into an independent module. However, in this workspace, you can directly infer to its code by importing.

### Web demo `packages/demo`

(Also used for testing core functionalities)

- Dev: `yarn dev`
- Build: `yarn build`, output to `dist/`
- Preview build output: `yarn preview`

### HTML export template `packages/static-resources`

- Build: `yarn build-wrapper`

### Desktop app `packages/desktop`

Prerequisite: Build the export template first. The build pipeline of the desktop app will copy the build output of the export template automatically.

- Dev: `yarn dev`
- Build: `yarn package`
- Build zip: `yarn make`

### Website `packages/website`

- Prerequisite: Build the web demo, and run `yarn presync` here to copy the results.
- Dev: `yarn start`
- Build: `yarn build`
- Preview build output: `yarn serve`
