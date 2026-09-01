// 校园指南 —— 板块数据
// 每个板块仅保留标题与说明；文件由管理员在页面上传，通过「板块」字段归入对应板块。

export type GuideSection = {
  id: string;
  title: string;
  desc?: string;
  // 特殊：杭电地图渲染为图片
  kind?: "default" | "map";
  imageUrl?: string;
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "major-transfer",
    title: "转专业（类）",
    desc: "转专业与大类分流政策与近年文件",
  },
  {
    id: "training-plan",
    title: "培养方案",
    desc: "培养方案管理与年度文件",
  },
  {
    id: "comprehensive-eval",
    title: "综合测评",
    desc: "综测实施办法与各学院细则",
  },
  {
    id: "competition",
    title: "竞赛政策",
    desc: "学科类与艺体类竞赛政策文件",
  },
  {
    id: "scholarship",
    title: "奖助学金",
    desc: "各类奖学金与助学金申请文件",
  },
  {
    id: "postgrad-recommend",
    title: "推免保研",
    desc: "保研与直博相关文件",
  },
  {
    id: "extracurricular",
    title: "课外教育",
    desc: "课外教育管理与二课成绩查询",
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
  },
  {
    id: "labor-edu",
    title: "劳动教育",
    desc: "劳动教育相关文件",
  },
  {
    id: "innovation",
    title: "创新创业",
    desc: "学分认定与查询入口",
  },
  {
    id: "credit-substitute",
    title: "学分替代",
    desc: "本科生 / 研究生学分替代办法",
  },
  {
    id: "tuition",
    title: "学费收缴",
    desc: "学分制收费与缴费方式",
  },
  {
    id: "student-work",
    title: "学生工作",
    desc: "省学联文件与社团管理",
  },
  {
    id: "overseas",
    title: "国际游学",
    desc: "出国（境）交流学习文件与表单",
  },
  {
    id: "useful-sites",
    title: "常用网站",
    desc: "校内外常用信息平台",
  },
  {
    id: "sunshine-run",
    title: "阳光长跑",
    desc: "阳光长跑管理与本学期办法",
  },
];
