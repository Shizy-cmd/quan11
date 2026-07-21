import { Link } from "@tanstack/react-router";
import { Pin, Calendar, ArrowRight } from "lucide-react";

const announcements = [
  {
    tag: "权益公告",
    title: "关于开展本学期食堂满意度调研的通知",
    date: "2026-07-08",
    pinned: true,
  },
  {
    tag: "政策更新",
    title: "宿舍楼晚间热水供应时间调整说明",
    date: "2026-07-05",
    pinned: true,
  },
  {
    tag: "工作动态",
    title: "权益中心六月问题处理月报：共受理反馈 86 件",
    date: "2026-07-01",
    pinned: false,
  },
];

export function AnnouncementsSection() {
  return (
    <section className="bg-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">最新权益动态</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              权益公告 | 最新校园服务动态
            </p>
          </div>
          <Link
            to="/announcements"
            className="text-sm font-medium text-primary hover:underline"
          >
            查看全部 →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {announcements.map((n) => (
            <Link
              key={n.title}
              to="/announcements"
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                  {n.tag}
                </span>
                {n.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    <Pin className="h-3 w-3" />
                    置顶
                  </span>
                )}
              </div>
              <h3 className="mt-4 flex-1 text-base font-semibold leading-snug text-foreground group-hover:text-primary">
                {n.title}
              </h3>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {n.date}
                </span>
                <span className="inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  查看 <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
