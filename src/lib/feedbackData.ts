// 权益反馈：前后端共用的分类与状态定义（客户端 & 服务端均可安全引用）

export const FEEDBACK_CATEGORIES = [
  { value: "dorm", label: "学生公寓" },
  { value: "teaching", label: "教学楼" },
  { value: "canteen", label: "食堂" },
  { value: "market", label: "教育超市" },
  { value: "campus", label: "校园环境" },
  { value: "library", label: "图书馆" },
  { value: "other", label: "其他" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

export const FEEDBACK_STATUSES = [
  { value: "pending", label: "待处理" },
  { value: "processing", label: "处理中" },
  { value: "done", label: "已办结" },
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]["value"];

export type FeedbackView = {
  id: string;
  ticket: string;
  name: string;
  contact: string;
  category: FeedbackCategory;
  categoryLabel: string;
  occurredAt: number;
  occurredAtText: string;
  detail: string;
  attachments: { link: string; text: string }[];
  status: FeedbackStatus;
  statusLabel: string;
  remark: string;
  createdAt: number;
  createdAtText: string;
};

export function categoryLabel(value: string): string {
  return FEEDBACK_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function categoryValue(label: string): string {
  return FEEDBACK_CATEGORIES.find((c) => c.label === label)?.value ?? label;
}

export function statusLabel(value: string): string {
  return FEEDBACK_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function statusValue(label: string): string {
  return FEEDBACK_STATUSES.find((s) => s.label === label)?.value ?? label;
}
