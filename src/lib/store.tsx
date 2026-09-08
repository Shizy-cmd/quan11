import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Announcement = {
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

export type Guide = {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  updatedAt: string;
  readingTime: string;
  featured?: boolean;
};

export type Feedback = {
  id: string;
  name?: string;
  contact: string;
  category: string;
  occurredAt: string;
  detail: string;
  attachments: { name: string; size: number }[];
  status: "pending" | "processing" | "done";
  createdAt: string;
};

const A_KEY = "hdsu.announcements.v1";
const G_KEY = "hdsu.guides.v1";
const F_KEY = "hdsu.feedbacks.v1";

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
];

const DEFAULT_GUIDES: Guide[] = [
  {
    id: "g-freshman-2026",
    title: "2026 级新生入学完全指南",
    summary: "报到流程、宿舍分配、军训准备、校园卡办理、常用 App 一站说明。",
    category: "freshman",
    tags: ["报到", "军训", "校园卡"],
    updatedAt: "2026-07-01",
    readingTime: "8 分钟",
    featured: true,
  },
  {
    id: "g-scholarship-apply",
    title: "国家奖学金 / 助学金申请流程一览",
    summary: "评定时间线、所需材料清单、评审公示、异议申诉渠道全览。",
    category: "scholarship",
    tags: ["国奖", "助学金", "材料"],
    updatedAt: "2026-06-20",
    readingTime: "6 分钟",
    featured: true,
  },
  {
    id: "g-dorm-rule",
    title: "宿舍管理条例与常见问题",
    summary: "调宿、报修、门禁、访客、卫生检查等常见问题官方解释。",
    category: "dorm",
    tags: ["调宿", "报修", "门禁"],
    updatedAt: "2026-05-14",
    readingTime: "5 分钟",
  },
  {
    id: "g-leave",
    title: "请假与外出流程说明",
    summary: "病假、事假、外出实习、跨校区请假的审批链路与所需证明。",
    category: "process",
    tags: ["请假", "外出", "审批"],
    updatedAt: "2026-05-02",
    readingTime: "4 分钟",
  },
  {
    id: "g-course",
    title: "选课与教务常见问题 FAQ",
    summary: "选课系统入口、退补选、重修、成绩复核、学分认定要点整理。",
    category: "academic",
    tags: ["选课", "重修", "成绩"],
    updatedAt: "2026-04-25",
    readingTime: "7 分钟",
    featured: true,
  },
  {
    id: "g-map",
    title: "校园设施与场馆分布图",
    summary: "教学楼、图书馆、体育馆、食堂、医务室位置与开放时间速查。",
    category: "campus",
    tags: ["场馆", "开放时间"],
    updatedAt: "2026-04-10",
    readingTime: "3 分钟",
  },
  {
    id: "g-mental",
    title: "心理咨询预约与保密说明",
    summary: "线上/线下预约方式、咨询流程、隐私保护条款与紧急求助电话。",
    category: "health",
    tags: ["心理", "预约", "保密"],
    updatedAt: "2026-03-28",
    readingTime: "5 分钟",
  },
  {
    id: "g-medical",
    title: "校医院就诊与医保报销指南",
    summary: "校医院科室、开放时间、医保定点转诊、报销材料准备。",
    category: "health",
    tags: ["校医院", "医保"],
    updatedAt: "2026-03-15",
    readingTime: "6 分钟",
  },
  {
    id: "g-cert",
    title: "各类证明开具与盖章流程",
    summary: "在读证明、成绩单、实习证明、出国材料盖章的部门与流程。",
    category: "process",
    tags: ["证明", "盖章"],
    updatedAt: "2026-03-05",
    readingTime: "4 分钟",
  },
];

type ContentStoreValue = {
  announcements: Announcement[];
  addAnnouncement: (
    a: Omit<Announcement, "id" | "date"> & Partial<Pick<Announcement, "date">>,
  ) => void;
  deleteAnnouncement: (id: string) => void;
  togglePin: (id: string) => void;
  guides: Guide[];
  addGuide: (g: Omit<Guide, "id" | "updatedAt"> & Partial<Pick<Guide, "updatedAt">>) => void;
  deleteGuide: (id: string) => void;
  feedbacks: Feedback[];
  addFeedback: (
    f: Omit<Feedback, "id" | "createdAt" | "status"> & Partial<Pick<Feedback, "status">>,
  ) => Feedback;
  updateFeedbackStatus: (id: string, status: Feedback["status"]) => void;
  deleteFeedback: (id: string) => void;
};

const ContentStoreContext = createContext<ContentStoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function generateTicketId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QY-${y}${m}${day}-${rand}`;
}

export function ContentStoreProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [guides, setGuides] = useState<Guide[]>(DEFAULT_GUIDES);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    setAnnouncements(load(A_KEY, DEFAULT_ANNOUNCEMENTS));
    setGuides(load(G_KEY, DEFAULT_GUIDES));
    setFeedbacks(load(F_KEY, [] as Feedback[]));
  }, []);

  const persistA = useCallback((next: Announcement[]) => {
    setAnnouncements(next);
    save(A_KEY, next);
  }, []);
  const persistG = useCallback((next: Guide[]) => {
    setGuides(next);
    save(G_KEY, next);
  }, []);
  const persistF = useCallback((next: Feedback[]) => {
    setFeedbacks(next);
    save(F_KEY, next);
  }, []);

  const value = useMemo<ContentStoreValue>(
    () => ({
      announcements,
      guides,
      feedbacks,
      addAnnouncement: (a) =>
        persistA([
          {
            ...a,
            id: `a-${Date.now()}`,
            date: a.date ?? today(),
          } as Announcement,
          ...announcements,
        ]),
      deleteAnnouncement: (id) => persistA(announcements.filter((x) => x.id !== id)),
      togglePin: (id) =>
        persistA(announcements.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x))),
      addGuide: (g) =>
        persistG([
          {
            ...g,
            id: `g-${Date.now()}`,
            updatedAt: g.updatedAt ?? today(),
          } as Guide,
          ...guides,
        ]),
      deleteGuide: (id) => persistG(guides.filter((x) => x.id !== id)),
      addFeedback: (f) => {
        const record: Feedback = {
          ...f,
          id: generateTicketId(),
          status: f.status ?? "pending",
          createdAt: new Date().toISOString(),
        };
        persistF([record, ...feedbacks]);
        return record;
      },
      updateFeedbackStatus: (id, status) =>
        persistF(feedbacks.map((x) => (x.id === id ? { ...x, status } : x))),
      deleteFeedback: (id) => persistF(feedbacks.filter((x) => x.id !== id)),
    }),
    [announcements, guides, feedbacks, persistA, persistG, persistF],
  );

  return <ContentStoreContext.Provider value={value}>{children}</ContentStoreContext.Provider>;
}

export function useContentStore() {
  const ctx = useContext(ContentStoreContext);
  if (!ctx) throw new Error("useContentStore must be used within <ContentStoreProvider>");
  return ctx;
}
