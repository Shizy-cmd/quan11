---
name: 学生权益中心 · 绿色编辑风官网
description: 墨绿大色块、奶油浅底、绿色系油画背景的学生权益服务平台
colors:
  cream-bg: "oklch(0.962 0.013 118)"
  ink: "oklch(0.28 0.032 155)"
  moss: "oklch(0.43 0.07 150)"
  leaf: "oklch(0.8 0.19 145)"
  sage: "oklch(0.78 0.07 152)"
  seed-block: "oklch(0.928 0.022 128)"
  muted-ink: "oklch(0.44 0.04 150)"
  hairline: "oklch(0.868 0.022 130)"
  card: "oklch(0.99 0.006 112)"
typography:
  art:
    fontFamily: "'Ma Shan Zheng', 'STKaiti', 'KaiTi', 'Noto Serif SC', serif"
    fontSize: "clamp(3.25rem, 13vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  scale:
    micro: "0.625rem"
    micro-label: "0.6875rem"
  display:
    fontFamily: "'Noto Serif SC', 'Noto Sans SC', serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Noto Sans SC', 'Inter', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Noto Sans SC', 'Inter', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.18em"
    textTransform: "uppercase"
rounded:
  sm: "2px"
  full: "9999px"
spacing:
  section-y: "5rem"
  section-y-lg: "7rem"
  container: "72rem"
  row-gap: "0.75rem"
components:
  button-primary:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.cream-bg}"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.75rem"
  chip-active:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.cream-bg}"
    rounded: "{rounded.full}"
  stat-block:
    backgroundColor: "{colors.seed-block}"
    rounded: "{rounded.sm}"
    padding: "1.75rem"
---

# Design System: 学生权益中心 · 绿色编辑风官网

## Overview

**Creative North Star: "The Campus Grove"**

一座属于校园的绿色编辑部：奶油色的纸面、深墨绿的结构块、亮绿的点睛，以及绿色系油画构成的"风景底"。整个系统像一本装帧克制但内容扎实的校刊——大标题先行、留白充分、细线分区，不用渐变、不用黑色描边卡片。

页面节奏是"块面 + 细线"的交替：梵高《绿色田野》做首屏整幅背景（铺满第一屏），书法大标题分两行错位排布，奶油色编辑式列表居中，统计区以麦田模糊渐淡做底，答疑页导航与页脚用睡莲暗化做底。油画只作背景或文字底，统一模糊 + 半透明纯色遮罩处理，不标注作者与来源。

**Key Characteristics:**
- 大块纯色（墨绿/奶油）替代渐变与阴影堆叠
- 绿色系油画作模糊渐淡的整幅背景或文字底，不标注作者
- 衬线大标题 + 无衬线正文的编辑排版
- 细发丝线分区，无黑线圆角卡片
- 单次滚动显现动画，无装饰性噪声

## Colors

绿色系、奶油底、墨绿主色块、亮绿点缀：整体是"自然纸张 + 校园绿荫"的气质。

### Primary
- **Moss 苔藓绿** (oklch(0.43 0.07 150)): 主结构色。首屏遮罩、页脚、主按钮、激活态胶囊、深色色块都使用它；在奶油底上承担"大块颜色"的对比角色。
- **Leaf 亮叶绿** (oklch(0.8 0.19 145)): 点睛色。仅用于高亮文字（"全意为你"）、数据数字、小徽标和 hover 强调；用量克制，不铺面。
- **Sage 鼠尾草绿** (oklch(0.78 0.07 152)): 低饱和中绿色。用于统计块与色块墙的浅色块，替代亮绿铺面，保证低饱和绿色系。

### Neutral
- **Cream 奶油纸** (oklch(0.962 0.013 118)): 全局背景与首屏文字色。
- **Ink 墨绿黑** (oklch(0.28 0.032 155)): 正文与标题文字色，带绿色倾向的深墨。
- **Seed Block 浅种子块** (oklch(0.928 0.022 128)): 统计块、搜索框底、轻量区域底。
- **Muted Ink 次级墨** (oklch(0.44 0.04 150)): 次级说明文字，与奶油底对比 ≥ 4.5:1。
- **Hairline 发丝线** (oklch(0.868 0.022 130)): 分区细线（常以 70% 透明度使用）。

### Named Rules
**The Grove Rule.** 深墨绿只属于"结构块"（首屏、页脚、按钮、激活态），亮绿只做点缀；奶油色是默认地面。任何一处大面积棕色、黑色描边或渐变都是对系统的背离。
**The Provenance-less Rule.** 油画只作背景或文字底，一律不标注作者、画作名与来源；内容未填充的条目必须明确显示"待补充"。

## Typography

**Display Font:** Noto Serif SC 900（衬线，fallback Noto Sans SC / serif）
**Body Font:** Noto Sans SC（fallback Inter / system-ui）
**Label Font:** Noto Sans SC 600，全大写，字距 0.18em

**Character:** 衬线标题带来校刊/编辑感，正文无衬线保持可读与克制。标题压缩字距、行高贴近 1.06，正文行高 1.75。

### Hierarchy
- **Display**（900，clamp(2.5rem, 6vw, 4.5rem)，1.06）：首屏标题、各板块大标题，独占一行优先。
- **Headline**（900，1.875–2.25rem，1.1）：板块内标题与卡片标题。
- **Body**（400–500，0.875–1.125rem，1.75）：说明文字、列表描述，正文行宽控制在 65–75ch 内。
- **Label**（600，0.875rem，0.18em，大写）：章节眉标（如 "What we do"）。

### Named Rules
**The Display-First Rule.** 大标题是页面第一视觉；任何区块先定标题层级，再谈装饰。

## Layout

单列滚动为主，内容容器 max-w-6xl（72rem），左右 padding 1rem/1.5rem；区块纵向间距 5rem，桌面 7rem。分区用顶部发丝线（1px，70% 透明度）而非边框卡片。服务采用编号编辑式行（01–04，行内 hover 变色），统计采用 2×2/4 列四色块（墨绿/浅种子/鼠尾草绿交替）托在麦田模糊背景上，校园指南首页为精选 6 个板块的 2/3 列色块矩阵（3:4 高宽、3px 圆角、低饱和四色），公告为细线分隔列表。移动端 375px 下：导航收起为汉堡菜单，首屏书法标题随视口缩放，色块墙 2 列。

## Elevation & Depth

平涂系统：深度由"色块对撞"与"细线分区"表达，不依赖阴影。hover 态允许带偏移+柔化的小阴影（如主按钮 `0 12px 26px -10px moss`）作为交互反馈；零偏移光晕仅作为纯色装饰圆，不承担阴影角色。

## Shapes

语言克制：大块面用直角或极小圆角（rounded-sm 2px），小型控件（按钮、胶囊、标签）用全圆角（9999px）。不出现黑线圆角卡片；油画背景使用图片模糊 + 半透明纯色遮罩（不引入 UI 渐变）；不使用几何蒙版裁切照片。

## Components

### Buttons
- **Shape:** 全圆角胶囊。
- **Primary:** 墨绿底 + 奶油字（padding 0.75rem 1.75rem）；hover 上移 2px 并出现墨绿柔影。
- **Secondary / Ghost:** 细发丝线描边胶囊，hover 变墨绿底奶油字。

### Chips
- **Style:** 发丝线描边、奶油底、次级墨字；激活态为墨绿底奶油字。
- **State:** 筛选/分类标签支持"待补充"灰标签与"来源"浅标签两种辅助态。

### Cards / Containers
- **Corner Style:** 无黑线卡片；数据/信息块用浅种子块（rounded-sm 2px）。
- **Background:** seed-block / card。
- **Shadow Strategy:** 无常态阴影；hover 允许柔影。
- **Border:** 顶部发丝线分隔，而非四周边框。
- **Internal Padding:** 1.5–2rem。

### Navigation
- **Style:** 无衬线 0.875rem，hover 浅底；激活态为墨绿胶囊（奶油字），桌面居中、移动端汉堡菜单。

### Hero Painting Backdrop（签名组件）
- 首屏整幅油画背景铺满首屏（min-h: calc(100svh − 4rem)，object-cover + blur 2px + 墨绿 55% 遮罩），书法字体（Ma Shan Zheng 楷书）大标题分两行错位——第一行靠左、第二行右对齐并略微越界，无按钮、无标注。

### Color Block Wall（签名组件）
- 校园指南首页以 adaline「Trusted by」为参考但克制化：只精选 6 个高频板块，2/3 列纯色块矩阵（aspect 4:3，圆角 3px），墨绿 / 鼠尾草绿 / 浅种子 / 奶油四种低饱和底色轮换，色块内含标题与一句说明，点击直达指南对应章节。

### Painting-backed Band（签名组件）
- 统计区：麦田油画模糊 3px + 奶油 85% 遮罩，四色统计块托底。
- 答疑页导航：睡莲油画模糊 3px + 墨绿 70% 遮罩，白色胶囊章节导航居中。
- 页脚：睡莲油画模糊 2px + 墨绿 85% 遮罩，奶油色文字收束。

### Editorial Row（签名组件）
- 服务与公告均采用"顶部发丝线 + 编号/日期 + 标题 + 箭头"的行式列表；hover 标题变墨绿并出现箭头位移。

### Guide Rows（指南页）
- 板块为顶部发丝线分隔的扁平区块（无底色、无圆角卡片）；未上传文件的占位条目不再渲染（用户明确删除）；每个分组只显示有真实文件的行（管理员上传行可点击），无内容的空白分组整组隐藏。

## Do's and Don'ts

### Do:
- **Do** 用大块墨绿与奶油做对撞，首屏整幅油画铺满第一屏，书法标题两行错位、无按钮。
- **Do** 用绿色系油画做模糊渐淡的背景或文字底，不标注作者与来源。
- **Do** 用发丝线分隔区块，用浅种子块承载数据。
- **Do** 用低饱和度绿色系（墨绿/鼠尾草绿/浅种子/奶油）呈现色块墙，亮绿只做点睛不铺面。
- **Do** 保持小字号次级文字与背景对比 ≥ 4.5:1。

### Don't:
- **Don't** 使用任何 UI 渐变、玻璃拟态、黑色圆角边框卡片。
- **Don't** 使用大面积棕色或非绿色系的深色块。
- **Don't** 在油画背景上添加作者 / 画作名 / "公版画作"等标注。
- **Don't** 在内容缺失时编造答案——必须显示"待补充"。
- **Don't** 在首屏标题旁堆按钮或装饰条。
