import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FRESHMAN_GUIDE,
  normalizeChapters,
  type GuideChapter,
  type GuideItem,
} from "@/lib/freshmanGuide";
import { useAuth } from "@/lib/auth";

const STORAGE_KEY = "hdsu.freshman-guide.v1";

export type GuideOverride = Partial<Pick<GuideItem, "title" | "content">> & {
  images?: string[];
};

function loadOverrides(): Record<string, GuideOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, GuideOverride>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persist(value: Record<string, GuideOverride>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* 存储空间不足时忽略，不影响当前页面 */
  }
}

function resolveChapters(
  base: GuideChapter[],
  overrides: Record<string, GuideOverride>,
): GuideChapter[] {
  return base.map((chapter) => ({
    ...chapter,
    items: chapter.items.map((item) => {
      const o = overrides[item.id];
      if (!o) return item;
      const content = o.content ?? item.content;
      return {
        ...item,
        title: o.title ?? item.title,
        content,
        placeholder: !content,
        images: o.images,
      };
    }),
  }));
}

export function useGuideData() {
  const { adminToken } = useAuth();
  const [base, setBase] = useState<GuideChapter[]>(FRESHMAN_GUIDE);
  const [overrides, setOverrides] = useState<Record<string, GuideOverride>>({});
  const [saving, setSaving] = useState(false);

  // 挂载后再读取本地编辑，避免与服务端首屏产生 hydration 差异。
  useEffect(() => {
    const loaded = loadOverrides();
    if (Object.keys(loaded).length > 0) setOverrides(loaded);
  }, []);

  // 挂载后从服务器（R2）拉取已发布的内容作为基础。
  useEffect(() => {
    let cancelled = false;
    fetch("/api/guide")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) return;
        // 旧版「章 → 分组」存档与当前目录不兼容时会返回 null，此时沿用内置目录。
        const remote = normalizeChapters(json.chapters);
        if (remote) setBase(remote);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const chapters = useMemo(() => resolveChapters(base, overrides), [base, overrides]);

  const commit = useCallback((next: Record<string, GuideOverride>) => {
    setOverrides(next);
    persist(next);
  }, []);

  const updateItem = useCallback((id: string, patch: GuideOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...patch } };
      persist(next);
      return next;
    });
  }, []);

  const removeImage = useCallback((id: string, index: number) => {
    setOverrides((prev) => {
      const cur = prev[id] ?? {};
      const images = (cur.images ?? []).filter((_, i) => i !== index);
      const next = { ...prev, [id]: { ...cur, images } };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    commit({});
  }, [commit]);

  const saveToServer = useCallback(async (): Promise<boolean> => {
    if (!adminToken) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/guide-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminToken,
        },
        body: JSON.stringify({ chapters }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "保存失败");
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [adminToken, chapters]);

  return { chapters, updateItem, removeImage, reset, saveToServer, saving };
}
