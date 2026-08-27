import { QA_ITEMS, type QAItem } from "@/lib/qaData";

export type GuideItem = {
  id: string;
  title: string;
  content?: string;
  placeholder?: boolean;
  sources?: { title: string; url?: string }[];
};

export type GuideGroup = {
  id: string;
  title: string;
  items: GuideItem[];
};

export type GuideChapter = {
  id: string;
  title: string;
  intro?: string;
  groups: GuideGroup[];
};

function placeholder(id: string, title: string): GuideItem {
  return { id, title, placeholder: true };
}

function item(id: string, title: string, qaId?: string): GuideItem {
  const q = qaId ? QA_ITEMS.find((x) => x.id === qaId) : undefined;
  if (q) {
    return { id, title, content: q.fullAnswer, sources: q.sources };
  }
  return placeholder(id, title);
}

function qaToItem(q: QAItem): GuideItem {
  return {
    id: q.id,
    title: q.question,
    content: q.fullAnswer,
    sources: q.sources,
  };
}

function faq(ids: string[]): GuideItem[] {
  return ids
    .map((id) => QA_ITEMS.find((q) => q.id === id))
    .filter((q): q is QAItem => Boolean(q))
    .map(qaToItem);
}

export const FRESHMAN_GUIDE: GuideChapter[] = [
  {
    id: "preparation",
    title: "开学准备篇",
    intro: "报到前要办的事：账号绑定、钉钉报到、户口与医保，一条条打勾。",
    groups: [
      {
        id: "prep-accounts",
        title: "1. 杭电账号绑定",
        items: [
          item("prep-accounts-1", "1.1 学号班级号获取教程"),
          item("prep-accounts-2", "1.2 智慧杭电"),
          item("prep-accounts-3", "1.3 钉钉杭州电子科技大学认证"),
          item("prep-accounts-4", "1.4 杭电助手认证流程"),
          item("prep-accounts-5", "1.5 杭电后勤生活认证"),
        ],
      },
      {
        id: "prep-register",
        title: "2. 钉钉新生报到模块",
        items: [
          item("prep-register-1", "2.1 完成指南"),
          item("prep-register-2", "2.2 安全教育"),
          item("prep-register-3", "2.3 入学登记"),
          item("prep-register-4", "2.4 手机选号"),
          item("prep-register-5", "2.5 学费缴纳"),
          item("prep-register-6", "2.6 报到码"),
        ],
      },
      {
        id: "prep-hukou",
        title: "3. 户口迁移（非必须）",
        items: [item("prep-hukou-1", "户口迁移办理说明")],
      },
      {
        id: "prep-arrival",
        title: "4. 杭电到达篇",
        items: [item("prep-arrival-1", "地铁优惠", "arrival-transport")],
      },
      {
        id: "prep-insurance",
        title: "5. 大学生医保缴纳",
        items: [item("prep-insurance-1", "大学生医保缴纳说明")],
      },
      {
        id: "prep-faq",
        title: "报到常见问题",
        items: faq([
          "campus-assignment",
          "registration-flow",
          "registration-materials",
          "living-supplies",
          "arrival-transport",
          "military-training",
          "first-week",
        ]),
      },
    ],
  },
  {
    id: "dorm",
    title: "宿舍篇",
    intro: "寝室怎么分、怎么住、怎么缴费，宿舍生活的问题都在这里。",
    groups: [
      {
        id: "dorm-basic",
        title: "1. 寝室基础介绍",
        items: [
          item("dorm-basic-1", "1.1 宿舍位置"),
          item("dorm-basic-2", "1.2 宿舍类型", "dorm-rooms"),
          item("dorm-basic-3", "1.3 宿舍环境"),
          item("dorm-basic-4", "1.4 宿舍宽带"),
          item("dorm-basic-5", "1.5 新生入住好物推荐", "living-supplies"),
        ],
      },
      {
        id: "dorm-fee",
        title: "2. 寝室费用说明",
        items: [item("dorm-fee-1", "寝室费用说明")],
      },
      {
        id: "dorm-life",
        title: "3. 寝室生活介绍",
        items: [item("dorm-life-1", "3.1 规章制度", "dorm-utilities")],
      },
      {
        id: "dorm-contact",
        title: "4. 常用联系方式（需补充）",
        items: [item("dorm-contact-1", "常用联系方式")],
      },
      {
        id: "dorm-faq",
        title: "宿舍常见问题",
        items: faq([
          "dorm-rooms",
          "dorm-assignment",
          "dorm-utilities",
          "campus-card",
          "lights-out",
        ]),
      },
    ],
  },
  {
    id: "life",
    title: "生活篇",
    intro: "地图、食堂、快递、自习、健身，把校园生活过明白。",
    groups: [
      {
        id: "life-map",
        title: "1. 地图篇",
        items: [
          placeholder("life-map-1", "1.1 平面地图"),
          placeholder("life-map-2", "1.2 全景地图"),
        ],
      },
      {
        id: "life-area",
        title: "2. 生活区篇",
        items: [
          item("life-area-1", "2.1 食堂干饭", "canteen"),
          item("life-area-2", "2.2 超市购物"),
          item("life-area-3", "2.3 快递收发", "express-address"),
          item("life-area-4", "2.4 自习佳处"),
          item("life-area-5", "2.5 健身沉淀"),
        ],
      },
      {
        id: "life-teaching",
        title: "3. 教学区篇",
        items: [
          item("life-teaching-1", "3.1 宝藏图书馆"),
          item("life-teaching-2", "3.2 教学楼寻址"),
          item("life-teaching-3", "3.3 活力体育场"),
          item("life-teaching-4", "3.4 月雅湖留声"),
        ],
      },
      {
        id: "life-faq",
        title: "生活常见问题",
        items: faq(["canteen", "campus-life", "express-address"]),
      },
    ],
  },
  {
    id: "aid",
    title: "助学政策篇",
    intro: "勤工助学、助学贷款、奖助学金，官方文件与申请渠道。",
    groups: [
      {
        id: "aid-channel",
        title: "1. 信息渠道",
        items: [item("aid-channel-1", "官方信息渠道")],
      },
      {
        id: "aid-policy",
        title: "2. 助学政策",
        items: [
          item("aid-policy-1", "2.1 勤工助学"),
          item("aid-policy-2", "2.2 助学贷款"),
          item("aid-policy-3", "2.3 国家助学贷款"),
          item("aid-policy-4", "2.4 助学金、补助"),
          item("aid-policy-5", "2.5 奖学金", "scholarship-loans"),
          item("aid-policy-6", "2.6 学杂费缴费方式"),
        ],
      },
      {
        id: "aid-faq",
        title: "资助常见问题",
        items: faq(["scholarship-loans"]),
      },
    ],
  },
  {
    id: "academic",
    title: "其他高频问题",
    intro: "选课、转专业、体育、竞赛与安全，新生最常问的补充问题。",
    groups: [
      {
        id: "academic-course",
        title: "课程与学业",
        items: faq([
          "course-selection",
          "transfer-conditions",
          "transfer-process",
          "pe-courses",
          "devices-textbooks",
        ]),
      },
      {
        id: "academic-growth",
        title: "发展与安全",
        items: faq(["competition-research", "scam-safety", "one-advice"]),
      },
    ],
  },
  {
    id: "appendix",
    title: "附录",
    intro: "校历、联系方式与实用速查。",
    groups: [
      {
        id: "appendix-list",
        title: "附录",
        items: [
          item("appendix-calendar", "校历"),
          item("appendix-counselor", "辅导员联系方式和钉钉群聊"),
          item("appendix-career", "毕业生就业指南"),
          item("appendix-bed-size", "五人寝尺寸"),
        ],
      },
    ],
  },
];

export function chapterCount(chapter: GuideChapter) {
  return chapter.groups.reduce((n, g) => n + g.items.length, 0);
}
