
# 学生权益中心 · 首页 & 品牌骨架（第一阶段）

本阶段只交付首页 + 顶部导航 + 底部信息 + 品牌视觉系统。后续再接入登录、反馈、进度、公告等模块。

## 一、视觉与品牌系统

- 配色：白 / 淡灰（分区） / 淡蓝（主色） / 淡绿（辅助/成功），黑灰做文字层级。Apple 风的克制、大量留白、大标题、细描边。
- 字体：中文标题使用 "Noto Sans SC" 700/800，正文 "Noto Sans SC" 400/500；英文/数字 "Inter"。通过 `__root.tsx` 的 `<link>` 加载 Google Fonts，不在 CSS 里 @import 远程字体。
- 圆角 `--radius: 1rem`，卡片浅阴影，按钮主色淡蓝、次要按钮描边款。
- 全部色值以 oklch 写入 `src/styles.css` 的 `:root`（覆盖模板默认蓝紫色），保留 shadcn tokens 结构。

## 二、资源

- 将上传的两张图片通过 `lovable-assets` 上传为 CDN 资源，生成 pointer：
  - `src/assets/quan11.png.asset.json`（权十一 IP）
  - `src/assets/hdsu-logo.png.asset.json`（HDSU 学生会 Logo）
- 组件中通过 pointer.url 引用，不把原图放进仓库。

## 三、页面结构（`src/routes/index.tsx`）

1. **顶部导航（sticky）**
   - 左：HDSU Logo + 站名「学生权益中心」
   - 中：首页 / 权益反馈 / 校园指南 / 进度查询 / 权益公告
   - 右：「登录」按钮（淡蓝主按钮，指向 `/login`，本阶段先占位链接）
2. **首屏 Hero**
   - 左侧大标题 `全心权益，全意为你`（超大号，字重 800，深灰）
   - 副标题「你的校园权益服务平台 | 反馈、查询、学习、参与，一站完成」
   - 两个 CTA：「我要反馈」(主) / 「查看校园指南」(次)
   - 右侧「权十一」IP 立绘，浅色椭圆背景 + 轻微悬浮，无复杂动画
   - 背景：白底 + 极淡蓝绿径向渐变
3. **快捷功能区** 6 张卡片（Lucide 图标 + 标题 + 一句说明）
   - 我要反馈 / 查看进度 / 校园指南 / 权益公告 / 权益调研 / 个人中心
4. **最新权益动态** 3 条公告卡片（占位内容，标签+标题+日期）
5. **权益处理公示** 2–3 条脱敏案例卡片（问题分类 tag、状态 badge、简述、处理时长）
6. **校园指南推荐** 高频文件网格（文件图标 + 标题 + 分类 + 下载按钮，占位数据）
7. **品牌语区**：一句大字口号「你的每一次反馈，都会被认真看见。」+ 权十一小图
8. **底部 Footer**
   - Logo + 「学生权益中心」+ 权十一小图
   - 联系方式 / 值班时间 / 办公地点 / 官方公众号·QQ / 友情链接 / 备案信息（占位）

## 四、技术细节

- 路由：仅 `src/routes/index.tsx` 承载全部首页内容；导航链接指向未来路由（`/feedback` `/guide` `/progress` `/announcements` `/login`），本阶段这些链接使用 `<a>` 占位（不创建路由文件，避免 404 之外的构建问题——404 页已由 `__root.tsx` 的 `notFoundComponent` 处理）。
- 组件拆分（都放 `src/components/home/`）：`SiteHeader.tsx` / `Hero.tsx` / `QuickActions.tsx` / `AnnouncementsSection.tsx` / `PublicCasesSection.tsx` / `GuideSection.tsx` / `BrandBanner.tsx` / `SiteFooter.tsx`。
- `src/routes/__root.tsx` 更新 head：中文 title「学生权益中心 | 全心权益，全意为你」、description、og:title、og:description、Google Fonts `<link>`；保留现有 `<Outlet />`、`NotFoundComponent`、`ErrorComponent`。
- 全部使用语义 token（`bg-background` `text-foreground` `bg-primary` 等），不写 `text-white` / `bg-[#xxx]`。
- 不引入新依赖；shadcn 的 Button / Card 已就绪，Lucide 图标可用。

## 五、不在本阶段范围

- 学号登录页面与鉴权（下一阶段做「任意学号+密码登录」演示版）
- 反馈表单、进度详情、公告详情、调研、科普、个人中心、后台
- Lovable Cloud / 数据库

完成后你会看到一个完整的品牌首页，可以直接决定下一步先做「登录 + 反馈表单」还是「校园指南列表」。
