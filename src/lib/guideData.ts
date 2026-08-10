// 校园指南 —— 分类数据
// 每个 link 的 href 暂用 "#"，后续替换为真实 PDF / 页面链接即可。
// type: pdf（文件）| link（网页）| wechat（公众号）| image（图片，仅 map 用）

export type GuideLink = {
  label: string;
  href: string;
  type?: "pdf" | "link" | "wechat";
};

export type GuideGroup = {
  title: string;
  note?: string;
  links: GuideLink[];
  // 三级分组（用于奖学金 / 学生工作 · 省学联文件）
  subgroups?: { title: string; links: GuideLink[] }[];
};

export type GuideSection = {
  id: string;
  title: string;
  desc?: string;
  // 特殊：杭电地图渲染为图片
  kind?: "default" | "map";
  imageUrl?: string;
  groups?: GuideGroup[];
};

const YEARS = ["2025", "2024", "2023", "2022"];

const COLLEGES = [
  "计算机学院",
  "电子信息学院",
  "通信工程学院",
  "自动化学院",
  "机械工程学院",
  "材料与环境工程学院",
  "理学院",
  "经济学院",
  "管理学院",
  "会计学院",
  "人文艺术与数字媒体学院",
  "外国语学院",
  "网络空间安全学院",
  "生命信息与仪器工程学院",
  "国际教育学院",
  "圣光机联合学院",
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "major-transfer",
    title: "转专业（类）",
    desc: "转专业与大类分流政策与近年文件",
    groups: [
      {
        title: "转专业（类）与大类分流实施办法",
        links: [{ label: "转专业（类）与大类分流实施办法", href: "#", type: "pdf" }],
      },
      {
        title: "相关文件（近四年）",
        links: YEARS.map((y) => ({
          label: `${y} 年转专业文件`,
          href: "#",
          type: "pdf" as const,
        })),
      },
    ],
  },
  {
    id: "training-plan",
    title: "培养方案",
    desc: "培养方案管理与年度文件",
    groups: [
      {
        title: "培养方案管理办法",
        links: [{ label: "培养方案管理办法", href: "#", type: "pdf" }],
      },
      {
        title: "相关文件（近四年）",
        links: YEARS.map((y) => ({
          label: `${y} 年培养方案`,
          href: "#",
          type: "pdf" as const,
        })),
      },
    ],
  },
  {
    id: "comprehensive-eval",
    title: "综合测评",
    desc: "综测实施办法与各学院细则",
    groups: [
      {
        title: "实施办法",
        links: [{ label: "综合测评实施办法", href: "#", type: "pdf" }],
      },
      {
        title: "相关文件（各学院综测细则）",
        links: COLLEGES.map((c) => ({
          label: `${c} 综合测评办法`,
          href: "#",
          type: "pdf" as const,
        })),
      },
    ],
  },
  {
    id: "competition",
    title: "竞赛政策",
    desc: "学科类与艺体类竞赛政策文件",
    groups: [
      {
        title: "学科类竞赛",
        links: [
          { label: "学科类竞赛政策 · 文件一", href: "#", type: "pdf" },
          { label: "学科类竞赛政策 · 文件二", href: "#", type: "pdf" },
          { label: "学科类竞赛政策 · 文件三", href: "#", type: "pdf" },
          { label: "学科类竞赛政策 · 文件四", href: "#", type: "pdf" },
        ],
      },
      {
        title: "艺体类竞赛",
        links: [{ label: "艺体类竞赛政策文件", href: "#", type: "pdf" }],
      },
    ],
  },
  {
    id: "scholarship",
    title: "奖助学金",
    desc: "各类奖学金与助学金申请文件",
    groups: [
      {
        title: "奖学金",
        links: [],
        subgroups: [
          { title: "校奖学金（本科）", links: [{ label: "校奖学金（本科）文件", href: "#", type: "pdf" }] },
          { title: "校奖学金（研究生）", links: [{ label: "校奖学金（研究生）文件", href: "#", type: "pdf" }] },
          { title: "浙江省政府奖学金", links: [{ label: "浙江省政府奖学金文件", href: "#", type: "pdf" }] },
          { title: "国家奖学金", links: [{ label: "国家奖学金文件", href: "#", type: "pdf" }] },
          { title: "国家励志奖学金", links: [{ label: "国家励志奖学金文件", href: "#", type: "pdf" }] },
          { title: "来华留学生奖学金", links: [{ label: "来华留学生奖学金文件", href: "#", type: "pdf" }] },
        ],
      },
      {
        title: "助学金",
        links: [],
        subgroups: [
          { title: "国家助学金", links: [{ label: "国家助学金文件", href: "#", type: "pdf" }] },
          { title: "研究生国家助学金", links: [{ label: "研究生国家助学金文件", href: "#", type: "pdf" }] },
        ],
      },
    ],
  },
  {
    id: "postgrad-recommend",
    title: "推免保研",
    desc: "保研与直博相关文件",
    groups: [
      { title: "保研文件", links: [{ label: "保研工作文件", href: "#", type: "pdf" }] },
      { title: "直博文件", links: [{ label: "直博工作文件", href: "#", type: "pdf" }] },
    ],
  },
  {
    id: "extracurricular",
    title: "课外教育",
    desc: "课外教育管理与二课成绩查询",
    groups: [
      {
        title: "课外教育管理办法",
        links: [{ label: "课外教育管理办法", href: "#", type: "pdf" }],
      },
      {
        title: "二课成绩查询",
        links: [{ label: "二课成绩查询入口", href: "#", type: "link" }],
      },
    ],
  },
  {
    id: "map",
    title: "杭电地图",
    desc: "校园区位与建筑分布",
    kind: "map",
    imageUrl: "", // 待管理员上传后填入图片 URL
  },
  {
    id: "library",
    title: "图书馆使用指南",
    desc: "图书馆官方公众号",
    groups: [
      {
        title: "官方公众号",
        links: [{ label: "杭电图书馆 · 公众号", href: "#", type: "wechat" }],
      },
    ],
  },
  {
    id: "labor-edu",
    title: "劳动教育",
    desc: "劳动教育相关文件",
    groups: [
      {
        title: "劳动教育文件",
        links: [
          { label: "劳动教育文件 · 一", href: "#", type: "pdf" },
          { label: "劳动教育文件 · 二", href: "#", type: "pdf" },
        ],
      },
    ],
  },
  {
    id: "innovation",
    title: "创新创业",
    desc: "学分认定与查询入口",
    groups: [
      {
        title: "创新创业学分认定",
        links: [{ label: "创新创业学分认定办法", href: "#", type: "pdf" }],
      },
      {
        title: "创新创业学分查询网站（VPN）",
        links: [{ label: "学分查询网站（校园 VPN）", href: "#", type: "link" }],
      },
    ],
  },
  {
    id: "credit-substitute",
    title: "学分替代",
    desc: "本科生 / 研究生学分替代办法",
    groups: [
      { title: "本科生", links: [{ label: "本科生学分替代办法", href: "#", type: "pdf" }] },
      { title: "研究生", links: [{ label: "研究生学分替代办法", href: "#", type: "pdf" }] },
    ],
  },
  {
    id: "tuition",
    title: "学费收缴",
    desc: "学分制收费与缴费方式",
    groups: [
      { title: "学分制收费文件", links: [{ label: "学分制收费文件", href: "#", type: "pdf" }] },
      { title: "缴费方式", links: [{ label: "缴费方式说明", href: "#", type: "pdf" }] },
    ],
  },
  {
    id: "student-work",
    title: "学生工作",
    desc: "省学联文件与社团管理",
    groups: [
      {
        title: "省学联文件",
        links: [],
        subgroups: [
          {
            title: "章程",
            links: [
              { label: "省学联章程 · 文件一", href: "#", type: "pdf" },
              { label: "省学联章程 · 文件二", href: "#", type: "pdf" },
            ],
          },
          {
            title: "作风规定",
            links: [
              { label: "省学联作风规定 · 文件一", href: "#", type: "pdf" },
              { label: "省学联作风规定 · 文件二", href: "#", type: "pdf" },
            ],
          },
          {
            title: "实施意见",
            links: [
              { label: "省学联实施意见 · 文件一", href: "#", type: "pdf" },
              { label: "省学联实施意见 · 文件二", href: "#", type: "pdf" },
            ],
          },
        ],
      },
      {
        title: "社团管理",
        links: [{ label: "社团管理文件", href: "#", type: "pdf" }],
      },
    ],
  },
  {
    id: "overseas",
    title: "国际游学",
    desc: "出国（境）交流学习文件与表单",
    groups: [
      {
        title: "国际交流派出指南",
        links: [
          { label: "国际交流派出指南 · 一", href: "#", type: "pdf" },
          { label: "国际交流派出指南 · 二", href: "#", type: "pdf" },
          { label: "国际交流派出指南 · 三", href: "#", type: "pdf" },
        ],
      },
      {
        title: "出国（境）交流学习管理办法",
        links: [
          { label: "管理办法 · 一", href: "#", type: "pdf" },
          { label: "管理办法 · 二", href: "#", type: "pdf" },
          { label: "管理办法 · 三", href: "#", type: "pdf" },
        ],
      },
      {
        title: "报销办法",
        links: [
          { label: "报销办法 · 一", href: "#", type: "pdf" },
          { label: "报销办法 · 二", href: "#", type: "pdf" },
          { label: "报销办法 · 三", href: "#", type: "pdf" },
        ],
      },
      {
        title: "本科生出国（境）交流学习相关表单",
        links: [
          { label: "相关表单 · 一", href: "#", type: "pdf" },
          { label: "相关表单 · 二", href: "#", type: "pdf" },
          { label: "相关表单 · 三", href: "#", type: "pdf" },
        ],
      },
    ],
  },
  {
    id: "useful-sites",
    title: "常用网站",
    desc: "校内外常用信息平台",
    groups: [
      {
        title: "校内网站",
        links: [
          { label: "杭电官网", href: "#", type: "link" },
          { label: "教务管理系统", href: "#", type: "link" },
          { label: "学生工作办公室", href: "#", type: "link" },
          { label: "校园一卡通", href: "#", type: "link" },
          { label: "图书馆", href: "#", type: "link" },
        ],
      },
      {
        title: "校外网站",
        links: [
          { label: "中国大学生在线", href: "#", type: "link" },
          { label: "浙江省教育考试院", href: "#", type: "link" },
          { label: "学信网", href: "#", type: "link" },
        ],
      },
    ],
  },
  {
    id: "sunshine-run",
    title: "阳光长跑",
    desc: "阳光长跑管理与本学期办法",
    groups: [
      {
        title: "阳光长跑管理规定办法",
        links: [{ label: "阳光长跑管理规定办法", href: "#", type: "pdf" }],
      },
      {
        title: "本学期阳光长跑办法",
        links: [
          { label: "本学期办法 · 公众号一", href: "#", type: "wechat" },
          { label: "本学期办法 · 公众号二", href: "#", type: "wechat" },
        ],
      },
    ],
  },
];
