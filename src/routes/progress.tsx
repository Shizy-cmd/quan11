import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  FileText,
  Loader2,
  Search,
  XCircle,
  ArrowRight,
} from "lucide-react";

import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "进度查询 | 学生权益中心" },
      {
        name: "description",
        content: "输入问题单号,实时查询你的权益反馈处理进度与时间线。",
      },
      { property: "og:title", content: "进度查询 | 学生权益中心" },
      {
        property: "og:description",
        content: "凭问题单号一键查询处理进度,让每一次反馈都有回音。",
      },
    ],
  }),
  component: ProgressPage,
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
  handler: string;
  eta: string;
  timeline: TimelineEntry[];
};

const STATUS_META: Record<
  TicketStatus,
  { label: string; className: string; icon: typeof Clock; step: number }
> = {
  pending: {
    label: "待受理",
    className: "bg-muted text-muted-foreground",
    icon: Clock,
    step: 1,
  },
  processing: {
    label: "处理中",
    className: "bg-primary/10 text-primary",
    icon: Loader2,
    step: 2,
  },
  resolved: {
    label: "已解决",
    className: "bg-accent/15 text-accent",
    icon: CheckCircle2,
    step: 3,
  },
  closed: {
    label: "已关闭",
    className: "bg-muted text-muted-foreground",
    icon: XCircle,
    step: 3,
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
    handler: "后勤保障部",
    eta: "2026-07-15 前完成更换",
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
    handler: "宿管中心",
    eta: "已于 2026-07-05 完成",
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
    handler: "待分配",
    eta: "预计 48 小时内受理",
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

const STEPS: { key: TicketStatus; label: string }[] = [
  { key: "pending", label: "已提交 · 待受理" },
  { key: "processing", label: "处理中" },
  { key: "resolved", label: "已解决" },
];

function ProgressPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [notFound, setNotFound] = useState(false);

  const ticket = useMemo(() => {
    if (!submitted) return null;
    const key = submitted.trim().toUpperCase();
    return MOCK_TICKETS.find((t) => t.id.toUpperCase() === key) ?? null;
  }, [submitted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) {
      toast.error("请输入问题单号");
      return;
    }
    setSubmitted(value);
    const found = MOCK_TICKETS.some(
      (t) => t.id.toUpperCase() === value.toUpperCase(),
    );
    setNotFound(!found);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-medium tracking-widest text-primary">
              TRACK · 进度查询
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              一键查询,让反馈有回音
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              输入你提交反馈时收到的问题单号,即可实时查看当前处理阶段、负责部门与完整时间线。
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="请输入问题单号,例如 QY-20260710-4821"
                  className="h-12 border-0 bg-transparent pl-11 font-mono text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" className="h-12 rounded-xl px-6">
                查询进度
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>示例单号:</span>
              {MOCK_TICKETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setQuery(t.id);
                    setSubmitted(t.id);
                    setNotFound(false);
                  }}
                  className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] transition-colors hover:border-primary hover:text-primary"
                >
                  {t.id}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {!submitted && <EmptyHint />}
          {submitted && notFound && <NotFoundCard id={submitted} />}
          {ticket && <TicketProgress ticket={ticket} />}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Search className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">
        输入问题单号开始查询
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        问题单号在你提交反馈成功后生成,也可在
        <Link to="/me" className="mx-1 text-primary hover:underline">
          个人中心
        </Link>
        查看。
      </p>
    </div>
  );
}

function NotFoundCard({ id }: { id: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <XCircle className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">
        没有找到匹配的问题单
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        请检查单号「
        <span className="font-mono text-foreground">{id}</span>
        」是否输入正确,或前往个人中心查看你提交的反馈。
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/me"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium hover:border-primary hover:text-primary"
        >
          去个人中心
        </Link>
        <Link
          to="/feedback"
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          提交新反馈
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function TicketProgress({ ticket }: { ticket: Ticket }) {
  const meta = STATUS_META[ticket.status];
  const StatusIcon = meta.icon;
  const currentStep = meta.step;

  function copyId() {
    navigator.clipboard?.writeText(ticket.id);
    toast.success("单号已复制");
  }

  return (
    <div className="space-y-6">
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
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
          >
            <StatusIcon
              className={`h-3.5 w-3.5 ${ticket.status === "processing" ? "animate-spin" : ""}`}
            />
            {meta.label}
          </span>
        </div>

        {/* Stepper */}
        <div className="mt-8">
          <div className="flex items-center">
            {STEPS.map((s, idx) => {
              const stepNum = idx + 1;
              const done = currentStep > stepNum;
              const active = currentStep === stepNum;
              return (
                <div key={s.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        done
                          ? "bg-accent text-accent-foreground"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                    </div>
                    <p
                      className={`whitespace-nowrap text-[11px] font-medium ${
                        done || active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 -translate-y-3 ${
                        currentStep > stepNum ? "bg-accent" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <InfoItem label="当前负责部门" value={ticket.handler} />
          <InfoItem label="预计进度" value={ticket.eta} />
          <InfoItem label="最近更新" value={ticket.updatedAt} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-2">
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

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
          <Link
            to="/me"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium hover:border-primary hover:text-primary"
          >
            查看我的全部反馈
          </Link>
          {ticket.status === "resolved" && (
            <Button className="h-10 rounded-full px-5">评价处理结果</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}