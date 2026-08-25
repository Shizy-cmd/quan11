import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquarePlus,
  BookOpen,
  ListChecks,
  UserRound,
  ArrowRight,
  Pin,
  Calendar,
} from "lucide-react";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useContentStore } from "@/lib/store";
import quan11 from "@/assets/quan11.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const modules = [
  {
    icon: MessageSquarePlus,
    title: "权益反馈",
    desc: "在线提交你的校园权益问题",
    href: "/feedback" as const,
  },
  {
    icon: BookOpen,
    title: "校园指南",
    desc: "制度文件与办事流程一站查阅",
    href: "/guide" as const,
  },
  {
    icon: ListChecks,
    title: "进度查询",
    desc: "反馈处理全流程可追踪",
    href: "/progress" as const,
  },
  {
    icon: UserRound,
    title: "个人中心",
    desc: "你的校园服务专属空间",
    href: "/me" as const,
  },
];

function Index() {
  const { announcements } = useContentStore();
  const recent = [...announcements]
    .sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 20% 10%, var(--hero-glow-blue) 0%, transparent 70%), radial-gradient(50% 45% at 85% 80%, var(--hero-glow-green) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-32">
            <div>
              <p className="mb-5 inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                杭州电子科技大学学生会 · 学生权益中心
              </p>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                全心权益，
                <br />
                全意为你
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                你的校园权益服务平台，反馈、查询、指南、参与，一站完成。
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-accent/60 blur-3xl" />
                <img
                  src={quan11}
                  alt="权十一 —— 学生权益中心 IP 形象"
                  className="w-64 rounded-[2.5rem] border border-border bg-card object-cover shadow-lg sm:w-72"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 四大板块 */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <Link
                key={m.href}
                to={m.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  进入 <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 近期公告 */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  近期公告
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  最新校园服务动态与政策更新
                </p>
              </div>
              <Link
                to="/announcements"
                className="text-sm font-medium text-primary hover:underline"
              >
                查看全部 →
              </Link>
            </div>
            <ul className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {recent.map((n) => (
                <li key={n.id}>
                  <Link
                    to="/announcements"
                    className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/60"
                  >
                    {n.pinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <Pin className="h-3 w-3" />
                        置顶
                      </span>
                    ) : (
                      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {n.title}
                    </span>
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                      <Calendar className="h-3.5 w-3.5" />
                      {n.date}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
