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

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a-canteen-2026-07",
    category: "notice",
    title: "关于开展本学期食堂满意度调研的通知",
    summary: "本次调研覆盖三个校区全部食堂档口，问卷开放至 7 月 20 日，参与即可抽取权十一周边。",
    date: "2026-07-08",
    author: "学生权益中心",
    readingTime: "2 分钟",
    pinned: true,
    content: [
      "为持续改善校园餐饮服务质量，学生权益中心联合后勤保障处开展本学期食堂满意度调研。",
      "调研时间：2026 年 7 月 8 日 — 7 月 20 日；覆盖校区：主校区、南校区、医学院校区全部食堂档口。",
      "参与方式：登录「学生权益中心」——权益调研，填写不超过 3 分钟。所有反馈匿名处理，结果将于 8 月初对外公示。",
      "参与调研的同学可参与权十一联名周边抽奖，中奖名单将在本页公告栏公布。",
    ],
  },
  {
    id: "a-hot-water-2026-07",
    category: "policy",
    title: "宿舍楼晚间热水供应时间调整说明",
    summary: "自 7 月 10 日起，全校学生公寓晚间热水供应延长至 23:30，覆盖考试周复习需求。",
    date: "2026-07-05",
    author: "后勤保障处 · 转发",
    readingTime: "1 分钟",
    pinned: true,
    content: [
      "根据同学们通过权益反馈提出的诉求，经与后勤保障处协商，自 2026 年 7 月 10 日起，全校学生公寓晚间热水供应时间调整为 18:00 — 23:30。",
      "如遇设备故障或临时检修，将通过公寓群和本公告栏第一时间通知。",
      "感谢通过反馈平台提出建议的 42 位同学。你的每一次反馈，都会被认真看见。",
    ],
  },
  {
    id: "a-june-report",
    category: "work",
    title: "权益中心六月问题处理月报：共受理反馈 86 件",
    summary: "六月共受理反馈 86 件，已办结 79 件，平均处理时长 4.2 天，满意度 92%。",
    date: "2026-07-01",
    author: "学生权益中心",
    readingTime: "3 分钟",
    content: [
      "2026 年 6 月，学生权益中心共受理各类权益反馈 86 件，其中：宿舍类 27 件、教务类 18 件、餐饮类 14 件、校园设施类 12 件、其他 15 件。",
      "已办结 79 件（91.8%），处理中 7 件；平均处理时长 4.2 天，同比上月缩短 0.8 天。",
      "回访满意度 92%，较上月提升 3 个百分点。感谢同学们的信任与耐心。",
      "月报详细数据与典型案例已同步至「权益公告」——处理公示。",
    ],
  },
  {
    id: "a-scholarship-2026",
    category: "policy",
    title: "2026 学年国家奖学金评审细则更新说明",
    summary: "评审权重调整、申诉窗口延长至 5 个工作日，具体条款以本次公告为准。",
    date: "2026-06-28",
    author: "学生资助中心 · 转发",
    readingTime: "4 分钟",
    content: [
      "本学年国家奖学金评审细则已由学生资助中心正式发布，主要变化：",
      "1. 综合测评权重由 60% 调整为 55%，科研创新权重由 20% 提升至 25%；",
      "2. 公示期后申诉窗口由 3 个工作日延长至 5 个工作日；",
      "3. 新增线上申诉入口，同步公开至「校园指南」——奖助学金。",
      "如对评审结果有异议，可在公示期内通过本站「权益反馈」提交，我们将协助转交并跟踪进度。",
    ],
  },
  {
    id: "a-case-library",
    category: "case",
    title: "处理公示：图书馆晚间关闭时间恢复至 22:30",
    summary: "经调研与协商，图书馆晚间关闭时间自 6 月 20 日起恢复至 22:30，处理时长 6 天。",
    date: "2026-06-20",
    author: "学生权益中心",
    readingTime: "2 分钟",
    content: [
      "问题分类：校园设施 | 关联反馈：F-2026-0611-018 等共 23 条",
      "处理时长：6 天 | 处理结果：已办结",
      "同学反映近期图书馆晚间 21:30 提前闭馆影响复习，经与图书馆管理处沟通，自 6 月 20 日起恢复 22:30 闭馆，并同步开放二楼自习区至 23:00。",
      "已通过短信与本页公告向所有提交反馈的同学回复，欢迎回访满意度评价。",
    ],
  },
  {
    id: "a-case-dorm",
    category: "case",
    title: "处理公示：3 号公寓电梯故障已完成维保",
    summary: "反馈次日安排应急电梯维保，已于 6 月 15 日完成并投入使用。",
    date: "2026-06-15",
    author: "学生权益中心",
    readingTime: "2 分钟",
    content: [
      "问题分类：宿舍管理 | 关联反馈：F-2026-0613-042",
      "处理时长：2 天 | 处理结果：已办结",
      "6 月 13 日收到 3 号公寓电梯异响与偶发停梯反馈，当晚即联系维保单位，14 日全天检修，15 日通过验收并恢复使用。",
      "已在公寓大厅张贴维保记录，欢迎监督。",
    ],
  },
  {
    id: "a-survey-summer",
    category: "notice",
    title: "暑期留校学生权益需求征集开放中",
    summary: "面向暑期留校的同学开放需求征集，涵盖住宿、餐饮、图书馆、班车等六大板块。",
    date: "2026-06-10",
    author: "学生权益中心",
    readingTime: "2 分钟",
    content: [
      "暑期留校期间，你在住宿、餐饮、班车、图书馆、体育馆、心理咨询等方面还有什么期待？",
      "即日起至 7 月 5 日，通过「权益调研」——暑期专项 提交建议，我们会汇总后与各职能部门统一对接。",
      "所有有效建议将获得权十一贴纸一份。",
    ],
  },
  {
    id: "a-may-report",
    category: "work",
    title: "权益中心五月工作月报与典型案例",
    summary: "五月共受理反馈 71 件，平均处理时长 5.0 天，满意度 89%。",
    date: "2026-06-01",
    author: "学生权益中心",
    readingTime: "3 分钟",
    content: [
      "五月受理各类反馈 71 件，宿舍与教务两类合计占比 63%。",
      "典型案例：图书馆座位预约系统升级、南门快递点动线优化、教学楼空调温度调整。",
      "详细数据请见「权益公告」——处理公示 · 五月月报。",
    ],
  },
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
