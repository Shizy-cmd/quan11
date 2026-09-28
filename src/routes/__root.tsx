import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ContentStoreProvider } from "@/lib/store";
import { useVisitTracking } from "@/hooks/use-visit-tracking";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">页面不存在</h2>
        <p className="mt-2 text-sm text-muted-foreground">你访问的页面不存在或已被移动。</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">页面加载失败</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          服务暂时出了点问题，你可以刷新重试或返回首页。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            重试
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "学生权益中心 | 杭州电子科技大学校学生会" },
      {
        name: "description",
        content:
          "杭州电子科技大学校学生会学生权益中心官方服务平台：权益反馈、新生指北、校园指南、权益公告，一站完成。让优秀成为一种习惯。",
      },
      { name: "author", content: "杭州电子科技大学校学生会学生权益中心" },
      { property: "og:title", content: "学生权益中心 | 杭州电子科技大学校学生会" },
      {
        property: "og:description",
        content:
          "校学生会学生权益中心官方服务平台：权益反馈、新生指北、校园指南、权益公告，一站完成。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "学生权益中心 | 杭州电子科技大学校学生会" },
      {
        name: "twitter:description",
        content:
          "校学生会学生权益中心官方服务平台：权益反馈、新生指北、校园指南、权益公告，一站完成。",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <div
          aria-hidden
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{
            __html:
              "<!-- direction:hdu-su-official | THESIS: 校学生会官方门户风——藏青结构色 + 校会标四色识别 + 系统黑体，标语「让优秀成为一种习惯」贯穿顶条、首屏与页脚。 | OWN-WORLD: 冷白底 + 藏青 #1D2A61 主色块 + 红/金/青/紫四色点缀；黑体标题、细线分区、小圆角、无渐变、无书法体。 | STORY: 访客一屏内读懂全心权益全意为你与标语，向下依次看到服务、数据、公告与指南。 | FIRST VIEWPORT: 藏青标语顶条 + 白底官方导航 + 四色条，首屏左文右标语图。 | FORM: 官方门户式单页（编号服务行 + 四色统计块 + 细线列表），code-led。 | FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. -->",
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useVisitTracking();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ContentStoreProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <Toaster position="top-center" richColors />
        </ContentStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
