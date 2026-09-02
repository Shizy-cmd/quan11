// 权益公告：前后端共用的分类定义

export const ANNOUNCE_CATEGORIES = [
  { value: "notice", label: "权益公告" },
  { value: "policy", label: "政策更新" },
  { value: "work", label: "工作动态" },
  { value: "case", label: "处理公示" },
] as const;

export type AnnounceCategory = (typeof ANNOUNCE_CATEGORIES)[number]["value"];

export type AnnouncementView = {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  readingTime: string;
  pinned?: boolean;
  content: string[];
  cover?: string;
  attachments?: { link: string; text: string }[];
};

export function announceLabel(value: string): string {
  return ANNOUNCE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function announceValue(label: string): string {
  return ANNOUNCE_CATEGORIES.find((c) => c.label === label)?.value ?? label;
}

export function isAnnounceCategory(value: string): value is AnnounceCategory {
  return ANNOUNCE_CATEGORIES.some((c) => c.value === value);
}
