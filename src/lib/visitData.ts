// 访问统计的共享类型（前后端通用，不依赖服务端环境）。

export type VisitDayPoint = {
  /** YYYY-MM-DD（北京时间） */
  date: string;
  pageviews: number;
  visitors: number;
};

export type VisitPageRow = {
  path: string;
  pageviews: number;
};

export type VisitStatsSummary = {
  /** 统计开始时间（ISO 字符串） */
  since: string;
  /** 最近一次记录时间（ISO 字符串），从未记录时为 null */
  updatedAt: string | null;
  totalPageviews: number;
  totalVisitors: number;
  todayPageviews: number;
  todayVisitors: number;
  /** 近 7 天（含今日）访问量合计 */
  weekPageviews: number;
  weekVisitors: number;
  /** 近 14 天（含今日）按天分布，缺失日期补 0 */
  daily: VisitDayPoint[];
  topPages: VisitPageRow[];
};

export type VisitStatsResponse = {
  ok: boolean;
  stats?: VisitStatsSummary;
  error?: string;
};

export type TrackVisitResponse = {
  ok: boolean;
  error?: string;
};
