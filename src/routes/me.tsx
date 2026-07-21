import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "个人中心 | 学生权益中心" },
      {
        name: "description",
        content: "查看你提交的权益反馈、当前状态与处理时间线。",
      },
      { property: "og:title", content: "个人中心 | 学生权益中心" },
      {
        property: "og:description",
        content: "我的反馈、处理状态与进度时间线，一站查看。",
      },
    ],
  }),
  component: MePage,
});

type TicketStatus = "pending" | "processing" | "resolved" | "closed";

type TimelineEntry = {
  time: string;
  title: string;
  desc?: string;
  actor?: string;
  status: TicketStatus | "created";
};

type Ticket = {
  id: string;
  title: string;
  category: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  timeline: TimelineEntry[];
};

const STATUS_META: Record<
  TicketStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "待受理",
    className: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  processing: {
    label: "处理中",
    className: "bg-primary/10 text-primary",
    icon: Loader2,
  },
  resolved: {
    label: "已解决",
    className: "bg-accent/15 text-accent",
    icon: CheckCircle2,
  },
  closed: {
    label: "已关闭",
    className: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
};

const MOCK_TICKETS: Ticket[] = [
  {
    id: "QY-20260710-4821",
    title: "三食堂二楼晚间灯光偏暗",
    category: "食堂餐饮",
    location: "三食堂 2F 东侧",
    createdAt: "2026-07-10 19:24",
    updatedAt: "2026-07-11 15:02",
    status: "processing",
    timeline: [
      {
        time: "2026-07-10 19:24",
        title: "反馈已提交",
        desc: "系统已生成问题单号 QY-20260710-4821",
        actor: "你",
        status: "created",
      },
      {
        time: "2026-07-11 09:10",
        title: "权益中心已受理",
        desc: "已分配至后勤保障部核实处理",
        actor: "权益中心 · 小满",
        status: "pending",
      },
      {
        time: "2026-07-11 15:02",
        title: "后勤已现场核查",
        desc: "确认二楼东侧 4 盏灯管故障,已安排本周内更换",
        actor: "后勤保障部",
        status: "processing",
      },
    ],
  },
  {
    id: "QY-20260628-1130",
    title: "3 号宿舍楼热水时段建议延长",
    category: "宿舍生活",
    location: "3 号宿舍楼",
    createdAt: "2026-06-28 22:11",
    updatedAt: "2026-07-05 10:45",
    status: "resolved",
    timeline: [
      {
        time: "2026-06-28 22:11",
        title: "反馈已提交",
        actor: "你",
        status: "created",
      },
      {
        time: "2026-06-29 10:30",
        title: "权益中心已受理",
        desc: "汇总同类反馈 12 条,提交宿管中心协商",
        actor: "权益中心",
        status: "pending",
      },
      {
        time: "2026-07-02 14:20",
        title: "宿管中心回复",
        desc: "同意试行延长热水供应至 23:30",
        actor: "宿管中心",
        status: "processing",
      },
      {
        time: "2026-07-05 10:45",
        title: "已解决并公示",
        desc: "新供水时段自 7 月 6 日起执行,详见权益公告",
        actor: "权益中心",
        status: "resolved",
      },
    ],
  },
  {
    id: "QY-20260620-0742",
    title: "图书馆自习区插座松动",
    category: "校园环境",
    location: "图书馆 3F 西侧",
    createdAt: "2026-06-20 15:08",
    updatedAt: "2026-06-20 15:08",
    status: "pending",
    timeline: [
      {
        time: "2026-06-20 15:08",
        title: "反馈已提交",
        desc: "等待权益中心受理",
        actor: "你",
        status: "created",
      },
    ],
  },
];

const FILTERS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待受理" },
  { value: "processing", label: "处理中" },
  { value: "resolved", label: "已解决" },
  { value: "closed", label: "已关闭" },
];

function MePage() {
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState<string>(MOCK_TICKETS[0].id);

  const filtered = useMemo(() => {
    return MOCK_TICKETS.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        return (
          t.title.toLowerCase().includes(k) ||
          t.id.toLowerCase().includes(k) ||
          t.location.toLowerCase().includes(k)
        );
      }
      return true;
    });
  }, [filter, keyword]);

  const active =
    MOCK_TICKETS.find((t) => t.id === activeId) ?? filtered[0] ?? null;

  const stats = useMemo(() => {
    return {
      total: MOCK_TICKETS.length,
      processing: MOCK_TICKETS.filter((t) => t.status === "processing").length,
      resolved: MOCK_TICKETS.filter((t) => t.status === "resolved").length,
      pending: MOCK_TICKETS.filter((t) => t.status === "pending").length,
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRound className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-widest text-primary">
                    MY CENTER · 个人中心
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                    你好,同学
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    这里汇总了你提交的所有反馈与处理进度。
                  </p>
                </div>
              </div>
              <Link
                to="/feedback"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                提交新反馈
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="累计反馈" value={stats.total} />
              <StatCard label="处理中" value={stats.processing} tone="primary" />
              <StatCard label="已解决" value={stats.resolved} tone="accent" />
              <StatCard label="待受理" value={stats.pending} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索标题、单号或地点"
                    className="h-10 pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFilter(f.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        filter === f.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="space-y-3">
                {filtered.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    没有符合条件的反馈
                  </li>
                )}
                {filtered.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(t.id)}
                      className={`block w-full rounded-2xl border p-4 text-left transition-colors ${
                        active?.id === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                          {t.title}
                        </p>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {t.id}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{t.category}</span>
                        <span>·</span>
                        <span className="line-clamp-1">{t.location}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        更新于 {t.updatedAt}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {active ? (
                <TicketDetail ticket={active} />
              ) : (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-card p-10 text-sm text-muted-foreground">
                  请选择左侧一条反馈查看详情
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "accent"
        ? "text-accent"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${meta.className}`}
    >
      <Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {meta.label}
    </span>
  );
}

function TicketDetail({ ticket }: { ticket: Ticket }) {
  function copyId() {
    navigator.clipboard?.writeText(ticket.id);
    toast.success("单号已复制");
  }
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={copyId}
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              {ticket.id}
              <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>
          <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
            {ticket.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{ticket.category}</span>
            <span>·</span>
            <span>{ticket.location}</span>
            <span>·</span>
            <span>提交于 {ticket.createdAt}</span>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground">
            处理时间线
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
        <ol className="relative space-y-6 border-l border-border pl-6">
          {ticket.timeline.map((entry, idx) => {
            const isLast = idx === ticket.timeline.length - 1;
            const Icon =
              entry.status === "resolved"
                ? CheckCircle2
                : entry.status === "processing"
                  ? Loader2
                  : entry.status === "closed"
                    ? XCircle
                    : entry.status === "created"
                      ? Circle
                      : Clock;
            const iconColor =
              entry.status === "resolved"
                ? "text-accent bg-accent/15"
                : entry.status === "processing"
                  ? "text-primary bg-primary/10"
                  : entry.status === "closed"
                    ? "text-muted-foreground bg-muted"
                    : isLast
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground bg-muted";
            return (
              <li key={idx} className="relative">
                <span
                  className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-card ${iconColor}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {entry.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                </div>
                {entry.desc && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {entry.desc}
                  </p>
                )}
                {entry.actor && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    — {entry.actor}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
        <Button variant="outline" className="h-10 rounded-full px-5">
          <MessageSquare className="mr-1.5 h-4 w-4" />
          追加说明
        </Button>
        {ticket.status === "resolved" && (
          <Button className="h-10 rounded-full px-5">评价处理结果</Button>
        )}
      </div>
    </div>
  );
}