import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const VISITOR_KEY = "hdsu.visitor.id";
/** 同一路径在该毫秒窗口内的重复上报会被忽略（React 严格模式 / 快速重渲染）。 */
const DEDUPE_WINDOW = 2000;

const recent = new Map<string, number>();

function readVisitorId(): string | undefined {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    // 隐私模式 / 禁用存储时仍统计浏览量，只是无法区分访客
    return undefined;
  }
}

function shouldSkip(path: string): boolean {
  const now = Date.now();
  const last = recent.get(path);
  if (last !== undefined && now - last < DEDUPE_WINDOW) return true;
  recent.set(path, now);
  return false;
}

/**
 * 记录页面浏览：路由变化时向 /api/track-visit 上报一次。
 * 上报失败静默忽略，不影响访客浏览。
 */
export function useVisitTracking() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!pathname || pathname.startsWith("/api") || pathname.startsWith("/admin")) return;
    if (shouldSkip(pathname)) return;

    const body = JSON.stringify({ path: pathname, visitorId: readVisitorId() });
    const timer = setTimeout(() => {
      void fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        /* 统计失败不影响浏览 */
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);
}
