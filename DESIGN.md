---
name: 学生权益中心 · 校学生会官方门户风
description: 藏青主色 + 校会标四色识别 + 系统黑体的校学生会官方服务平台
colors:
  page-bg: "oklch(97.4% 0.0054 275)"
  ink: "oklch(24.3% 0.0294 272.5)"
  card: "oklch(99.2% 0.003 270)"
  navy: "#1D2A61"
  brand-red: "#D73C3F"
  brand-gold: "#EBB635"
  brand-cyan: "#2BAAC3"
  brand-purple: "#81557A"
  muted-ink: "oklch(48.3% 0.0353 268.7)"
  hairline: "oklch(90% 0.013 265)"
  input-border: "oklch(87.5% 0.014 266)"
  seed-block: "oklch(95.4% 0.0103 261.8)"
typography:
  display:
    fontFamily: "'Source Han Sans SC', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "'Microsoft YaHei', 'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC', 'Noto Sans SC', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.3em"
rounded:
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  section-y: "5rem"
  section-y-lg: "7rem"
  container: "72rem"
  row-gap: "0.75rem"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-accent:
    backgroundColor: "{colors.brand-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  stat-block:
    backgroundColor: "四色轮换（navy / red / gold / cyan）"
    rounded: "{rounded.sm}"
    padding: "1.75rem"
  brand-stripe:
    height: "3px"
    segments:
      ["{colors.brand-red}", "{colors.brand-gold}", "{colors.brand-cyan}", "{colors.brand-purple}"]
---

# Design System: 学生权益中心 · 校学生会官方门户风

## Overview

**Creative North Star: "Official Union"**

以杭州电子科技大学校学生会视觉识别（VI）为基准的官方门户：藏青 `#1D2A61` 承担全部结构角色（顶条、导航激活态、页脚、主按钮），校会标四色（红 / 金 / 青 / 紫）只做识别性点缀——四色条、统计色块、指南色块墙。页面底为冷白，文字为近藏青墨色，中性色一律带轻微蓝灰倾向。参考对象是杭电官网一类的中国高校门户：白底、信息清晰、黑体标题、细线分区、小圆角。

**Key Characteristics:**

- 藏青大色块（顶条 / 页脚 / 激活态）+ 冷白页面底
- 校会四色条作为贯穿全站的品牌识别（header 底边、footer 顶边）
- 系统黑体优先（微软雅黑 / 苹方 / 思源黑体），标题 Bold 字重、常规字距
- 无书法体、无衬线大黑体、无英文大写眉标、无油画背景、无渐变
- 细线分区，小圆角（4–6px），胶囊仅用于标签 chip

## Colors

### Primary

- **Navy 藏青** (#1D2A61): 校会标标准藏青。顶条、导航激活态、页脚、主按钮、色块墙主块，是全站唯一的大面积深色。

### Brand Four（校会标四色，取自校会标 PNG 实测值）

- **Brand Red** (#D73C3F): 强调与 CTA（「我要反馈」按钮、眉标红杠、置顶/强调 chip）。
- **Brand Gold** (#EBB635): 统计色块与色块墙，navy 底上的数字点缀色。
- **Brand Cyan** (#2BAAC3): 统计色块与色块墙。
- **Brand Purple** (#81557A): 色块墙与四色条，用量最少。

### Neutral

- **Page BG 冷白** (oklch(97.4% 0.0054 275)): 全局背景。
- **Ink 墨色** (oklch(24.3% 0.0294 272.5)): 正文与标题。
- **Card** (oklch(99.2% 0.003 270)): 卡片与首屏底（不用纯白 #fff）。
- **Seed Block 浅蓝灰块** (oklch(95.4% 0.0103 261.8)): 次级底色、统计区带、hover 底。
- **Muted Ink 次级墨** (oklch(48.3% 0.0353 268.7)): 次级说明文字，与冷白对比 ≥ 4.5:1。
- **Hairline 细线** (oklch(90% 0.013 265)): 分区细线；表单控件边线用更深的 input-border (oklch(87.5% 0.014 266))。

### Named Rules

**The Union Rule.** 藏青只属于结构块（顶条、页脚、按钮、激活态）；四色只做点缀与色块，不铺满正文区；红只做强调与 CTA。任何渐变、书法体、油画背景都是对系统的背离。
**The Stripe Rule.** 四色条（红金青紫等分 3px）只出现在 header 底边与 footer 顶边，不作为内容分隔线滥用。
**The Contrast Rule（hallmark 校准）.** 大色块文字对比度下限：navy 底白字、red 底白字（4.56:1）、purple 底白字（5.98:1）、**gold 底藏青字（7.25:1）与 cyan 底藏青字（4.91:1）**——青色底严禁白字（仅 2.75:1）。纸面/墨色/中性灰一律 OKLCH 且锚定藏青色相；品牌四色保留校会标精确 hex。

## Typography

**Display Font:** Source Han Sans SC / 微软雅黑 / 苹方，700（`font-display` + `font-bold`）
**Body Font:** 微软雅黑 / 苹方 / HarmonyOS Sans SC / 思源黑体（系统优先，Noto Sans SC 仅兜底）
**Label Font:** 600，中文眉标字距 0.3em，前置 1px 红杠

**Character:** 全站黑体，系统字体优先——这是「脱离 AI 感」的核心手段：不加载书法体与衬线大黑体，不用负字距，不用英文大写眉标。层级由字号 + 字重 + 颜色拉开。

### Hierarchy

- **Display**（700，clamp(1.875rem, 4vw, 3rem)，1.25）：首屏标题与各板块大标题。
- **Headline**（700，1.5–2.25rem，1.3）：板块内标题与卡片标题。
- **Body**（400，0.875–1.125rem，1.75）：说明与列表，行宽 65–75ch。
- **Label**（600，0.75rem，0.3em）：中文眉标（服务职能 / 工作数据 / 工作动态）。

### Named Rules

**The Chinese-Label Rule.** 页面眉标一律中文，不使用英文大写单词；英文仅保留在文件类型角标（PDF）等必要处。

## Layout

单列滚动为主，内容容器 max-w-6xl（72rem），左右 padding 1rem/1.5rem；区块纵向间距 5rem，桌面 7rem。分区用顶部细线（1px #DDE2EC）而非边框卡片。Header 三段式：藏青标语顶条（h-8）→ 白底导航（h-16）→ 四色条（3px），整体 sticky。首屏为白底两栏：左侧标语性文案 + 双 CTA，右侧校会标标语图「让优秀成为一种习惯」。服务为编号编辑式行（01–04），统计为 4 列四色块，指南色块墙 2/3 列轮换四色，公告为细线分隔列表。移动端 375px：导航收起汉堡菜单，色块墙 2 列。

## Elevation & Depth

平涂系统：深度由色块对撞与细线分区表达。hover 态允许小阴影（如 CTA `0 12px 26px -10px` 藏青/红色柔影）作交互反馈；常态无阴影。

## Shapes

大块面与按钮用小圆角（6px），信息块 4px，仅标签 chip 用全圆角（9999px）。无黑线圆角卡片，无渐变，无几何蒙版裁切照片。

## Components

### Buttons

- **Primary:** 藏青底白字（rounded-md）；hover 变深。
- **Accent:** 校会红底白字，仅用于首屏「我要反馈」等主 CTA。
- **Secondary / Ghost:** 细线描边，hover 变藏青底白字（outline/ghost 的 hover 走 accent 红底白字）。

### Chips

- 细线描边、白底、次级墨字；激活态藏青底白字；强调 chip 为红底白字。

### Cards / Containers

- 小圆角 4px 浅蓝灰块承载数据；分区靠顶部细线；内部 padding 1.5–2rem。

### Navigation

- 黑体 0.875rem 方角（rounded-md），hover 浅蓝灰底；激活态藏青底白字；桌面居中、移动端汉堡菜单。

### Slogan Strip（签名组件）

- 藏青顶条内白字标语「让优秀成为一种习惯」（字距 0.28em），右侧「杭州电子科技大学官网」链接；每个页面可见。

### Brand Stripe（签名组件）

- 红 / 金 / 青 / 紫等分 3px 横条，位于 header 底边与 footer 顶边。

### Hero（签名组件）

- 白底两栏：左侧红杠眉标（杭州电子科技大学学生会 · 学生权益中心）+ 藏青大标题「全心权益 / 全意为你」+ 双 CTA；右侧校会标语图「让优秀成为一种习惯」（`hdsu-su-slogan.png`，透明底）。

### Color Block Wall（签名组件）

- 校园指南首页 6 个高频板块，2/3 列纯色块矩阵（aspect 4:3，圆角 4px），navy / red / gold / cyan / purple 轮换，白字（gold 块用藏青字）。

### Four-Color Stats（签名组件）

- 统计区浅蓝灰底带，四色统计块（navy+金字 / red / gold+藏青字 / cyan）。

### Editorial Row（签名组件）

- 服务与公告均为「顶部细线 + 编号/日期 + 标题 + 箭头」行式列表；hover 标题变藏青。

### Logo & Slogan Assets

- `hdsu-su-logo.png`：校会标横版标准字（透明底），用于白底 header。
- `hdsu-su-logo-white.png`：藏青字改白的标准字，用于藏青 footer。
- `hdsu-su-mark.png`：校会标图形标（透明底）。
- `hdsu-su-slogan.png`：标语图「让优秀成为一种习惯」（透明底），用于首屏。

## Do's and Don'ts

### Do:

- **Do** 用藏青与冷白做结构对撞，四色只做点缀与色块。
- **Do** 用四色条（header 底边 / footer 顶边）建立品牌识别。
- **Do** 用系统黑体、中文眉标、常规字距呈现官方气质。
- **Do** 用细线分隔区块，用四色块承载数据。
- **Do** 保持次级文字与背景对比 ≥ 4.5:1。

### Don't:

- **Don't** 使用渐变、玻璃拟态、黑线圆角边框卡片。
- **Don't** 使用书法体、衬线大黑体、英文大写眉标等「AI 落地页」语汇。
- **Don't** 把四色铺满正文区或作为长文背景。
- **Don't** 在内容缺失时编造答案——必须显示「待补充」。
