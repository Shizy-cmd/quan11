import { QA_ITEMS, type QAItem } from "@/lib/qaData";

export type GuideSource = { title: string; url?: string };

export type GuideItem = {
  id: string;
  title: string;
  content?: string;
  placeholder?: boolean;
  sources?: GuideSource[];
  images?: string[];
};

export type GuideChapter = {
  id: string;
  /** 中文序号，如「一」「二」，用于「一、HDUer 的第一颗纽扣」式标题与左侧目录。 */
  numeral: string;
  title: string;
  intro?: string;
  items: GuideItem[];
};

function placeholder(id: string, title: string): GuideItem {
  return { id, title, placeholder: true };
}

/**
 * 一个单元 = 一条已审核问答（多条可合成一条，之间空行分段）。
 * 找不到对应问答时保留「待补充」占位，绝不编造内容。
 */
function item(id: string, title: string, qaIds?: string | string[]): GuideItem {
  const ids = typeof qaIds === "string" ? [qaIds] : (qaIds ?? []);
  const answers = ids
    .map((qaId) => QA_ITEMS.find((q) => q.id === qaId))
    .filter((q): q is QAItem => Boolean(q));

  if (answers.length === 0) return placeholder(id, title);

  return {
    id,
    title,
    content: answers.map((q) => q.fullAnswer).join("\n\n"),
  };
}

export const FRESHMAN_GUIDE: GuideChapter[] = [
  {
    id: "first-button",
    numeral: "一",
    title: "HDUer 的第一颗纽扣",
    intro: "报到前先把账号、认证和入学手续办妥——这是成为 HDUer 的第一颗纽扣。",
    items: [
      item("first-button-1", "1.1 数字杭电平台激活"),
      item("first-button-2", "1.2 支付宝和微信校园身份认证"),
      item("first-button-3", "1.3 钉钉学校组织认证"),
      item("first-button-4", "1.4 账号与信息安全"),
      item("first-button-5", "1.5 团组织关系及户口迁移"),
      item("first-button-6", "1.6 入学体检"),
    ],
  },
  {
    id: "live",
    numeral: "二",
    title: "住在杭电",
    intro: "宿舍怎么分、屋里有什么、水电网络怎么用，住得舒服才学得踏实。",
    items: [
      item("live-1", "2.1 宿舍类型与床位尺寸", "dorm-rooms"),
      item("live-2", "2.2 宿舍设施与费用"),
      item("live-3", "2.3 热水、洗衣、空调和宽带", "dorm-utilities"),
      item("live-4", "2.4 入住物品准备", "living-supplies"),
      item("live-5", "2.5 报修与生活服务"),
    ],
  },
  {
    id: "study",
    numeral: "三",
    title: "学在杭电",
    intro: "课表、选课、图书馆、自习与成绩，学业上的关键节点先弄清楚。",
    items: [
      item("study-1", "3.1 课表、选课与教学系统", "course-selection"),
      item("study-2", "3.2 图书馆使用"),
      item("study-3", "3.3 教学楼与自习空间"),
      item("study-4", "3.4 考试成绩与学业提醒"),
      item("study-5", "3.5 奖助学金与绿色通道", "scholarship-loans"),
    ],
  },
  {
    id: "eat",
    numeral: "四",
    title: "吃在杭电",
    intro: "食堂在哪、怎么付钱，每天三顿的小事也别踩坑。",
    items: [item("eat-1", "4.1 食堂分布", "canteen"), item("eat-2", "4.2 校园支付", "campus-card")],
  },
  {
    id: "travel",
    numeral: "五",
    title: "行在杭电",
    intro: "校区地址、报到交通、校内通行、公交地铁与快递收发。",
    items: [
      item("travel-1", "5.1 校区地址", "campus-assignment"),
      item("travel-2", "5.2 报到交通", "arrival-transport"),
      item("travel-3", "5.3 校园内通行", "campus-life"),
      item("travel-4", "5.4 公交地铁"),
      item("travel-5", "5.5 快递收发", "express-address"),
    ],
  },
  {
    id: "appendix",
    numeral: "六",
    title: "附录",
    intro: "材料清单、地图校历、安全与医保、运动和最后一句叮嘱。",
    items: [
      item("appendix-1", "6.1 报到材料清单", "registration-materials"),
      item("appendix-2", "6.2 校园地图与校历"),
      item("appendix-3", "6.3 新生安全教育", "scam-safety"),
      item("appendix-4", "6.4 大学生医保缴纳"),
      item("appendix-5", "6.5 运动健身", "pe-courses"),
      item("appendix-6", "6.6 校园生活地图速览"),
      item("appendix-7", "6.7 写在最后", "one-advice"),
    ],
  },
];

export function guideItemCount(chapters: GuideChapter[]) {
  return chapters.reduce((n, c) => n + c.items.length, 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeItems(raw: unknown): GuideItem[] {
  if (!Array.isArray(raw)) return [];
  const items: GuideItem[] = [];
  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry.title !== "string" || entry.title.trim() === "") continue;
    const content = typeof entry.content === "string" ? entry.content : undefined;
    items.push({
      id: typeof entry.id === "string" && entry.id ? entry.id : `item-${items.length + 1}`,
      title: entry.title,
      content,
      placeholder: !content,
      sources: Array.isArray(entry.sources) ? (entry.sources as GuideSource[]) : undefined,
      images: Array.isArray(entry.images) ? (entry.images as string[]) : undefined,
    });
  }
  return items;
}

/**
 * 校验 R2 上保存的章节数据。
 * 目录已改为「章 → 单元」两层；旧版「章 → 分组 → 条目」的存档无法映射到新框架，
 * 这种情况返回 null，由调用方回退到内置的最新目录。
 */
export function normalizeChapters(raw: unknown): GuideChapter[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const chapters: GuideChapter[] = [];
  for (const [index, entry] of raw.entries()) {
    if (!isRecord(entry) || !Array.isArray(entry.items)) return null;
    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    if (!title) return null;
    chapters.push({
      id: typeof entry.id === "string" && entry.id ? entry.id : `chapter-${index + 1}`,
      numeral: typeof entry.numeral === "string" ? entry.numeral : String(index + 1),
      title,
      intro: typeof entry.intro === "string" ? entry.intro : undefined,
      items: normalizeItems(entry.items),
    });
  }

  return chapters.length > 0 ? chapters : null;
}
