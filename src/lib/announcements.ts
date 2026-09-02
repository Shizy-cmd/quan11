// 权益公告：客户端数据层（挂载时从后端加载，兜底用种子数据；管理员增删改走 API）

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  DEFAULT_ANNOUNCEMENTS,
  type Announcement,
} from "@/lib/store";
import type { AnnouncementView } from "@/lib/announceData";

export type AnnouncementPayload = {
  category: string;
  title: string;
  summary: string;
  author?: string;
  readingTime: string;
  pinned: boolean;
  content: string[];
  date?: string;
  cover?: File | null;
  attachments?: File[];
};

export function useAnnouncements() {
  const { adminToken } = useAuth();
  const [items, setItems] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      const json = (await res.json()) as {
        ok: boolean;
        items?: AnnouncementView[];
      };
      if (json.ok && json.items && json.items.length > 0) {
        setItems(json.items);
      }
    } catch {
      /* 加载失败则沿用种子数据 */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: AnnouncementPayload): Promise<boolean> => {
      if (!adminToken) {
        toast.error("请先登录管理员");
        return false;
      }
      const fd = new FormData();
      fd.append("category", payload.category);
      fd.append("title", payload.title);
      fd.append("summary", payload.summary);
      fd.append("author", payload.author ?? "学生权益中心");
      fd.append("readingTime", payload.readingTime);
      fd.append("pinned", String(payload.pinned));
      fd.append("content", JSON.stringify(payload.content));
      if (payload.date) fd.append("date", payload.date);
      if (payload.cover instanceof File) fd.append("cover", payload.cover);
      for (const f of payload.attachments ?? []) fd.append("attachments", f);
      try {
        const res = await fetch("/api/create-announcement", {
          method: "POST",
          headers: { "X-Admin-Password": adminToken },
          body: fd,
        });
        const json = (await res.json()) as {
          ok: boolean;
          item?: AnnouncementView;
          error?: string;
        };
        if (!json.ok || !json.item) throw new Error(json.error ?? "发布失败");
        setItems((prev) => [json.item as Announcement, ...prev]);
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "发布失败");
        return false;
      }
    },
    [adminToken],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!adminToken) {
        toast.error("请先登录管理员");
        return;
      }
      try {
        const res = await fetch("/api/delete-announcement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Password": adminToken,
          },
          body: JSON.stringify({ id }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };
        if (!json.ok) throw new Error(json.error ?? "删除失败");
        setItems((prev) => prev.filter((x) => x.id !== id));
        toast.success("公告已删除");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "删除失败");
      }
    },
    [adminToken],
  );

  const togglePin = useCallback(
    async (id: string): Promise<void> => {
      if (!adminToken) {
        toast.error("请先登录管理员");
        return;
      }
      const target = items.find((x) => x.id === id);
      if (!target) return;
      const next = !target.pinned;
      try {
        const res = await fetch("/api/toggle-announcement-pin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Password": adminToken,
          },
          body: JSON.stringify({ id, pinned: next }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };
        if (!json.ok) throw new Error(json.error ?? "更新失败");
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, pinned: next } : x)),
        );
        toast.success(next ? "已置顶" : "已取消置顶");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "更新失败");
      }
    },
    [adminToken, items],
  );

  return { items, loading, refresh, create, remove, togglePin };
}
