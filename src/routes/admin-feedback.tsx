import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ExternalLink,
  Loader2,
  Paperclip,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
  Eye,
  Users,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type FeedbackView,
  type FeedbackStatus,
} from "@/lib/feedbackData";
import type { VisitStatsResponse, VisitStatsSummary } from "@/lib/visitData";

export const Route = createFileRoute("/admin-feedback")({
  head: () => ({
    meta: [
      { title: "反馈管理 | 学生权益中心" },
      { name: "description", content: "权益反馈后台：查看、筛选、跟进与办结。" },
      { property: "og:title", content: "反馈管理 | 学生权益中心" },
    ],
  }),
  component: AdminFeedbackPage,
});

function maskPhone(phone: string): string {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") || phone;
}

function maskName(name: string): string {
  if (!name) return "匿名";
  if (name.length <= 1) return `${name}*`;
  return `${name[0]}**`;
}

function statusVariant(status: FeedbackStatus) {
  if (status === "processing") return "default";
  if (status === "done") return "secondary";
  return "outline";
}

function AdminFeedbackPage() {
  const { isAdmin, adminToken, loginAdmin } = useAuth();
  const [pwd, setPwd] = useState("");
  const [logggingIn, setLogggingIn] = useState(false);

  const [items, setItems] = useState<FeedbackView[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      const res = await fetch(`/api/feedback-list?${params.toString()}`, {
        headers: { "X-Admin-Password": adminToken },
      });
      const json = (await res.json()) as { ok: boolean; items: FeedbackView[] };
      setItems(json.items ?? []);
    } catch {
      setItems([]);
      toast.error("读取失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [adminToken, statusFilter, categoryFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.trim()) return;
    setLogggingIn(true);
    const ok = await loginAdmin(pwd.trim());
    setLogggingIn(false);
    if (ok) {
      toast.success("登录成功");
      setRefreshKey((k) => k + 1);
    } else {
      toast.error("密码错误");
    }
  };

  const updateStatus = async (id: string, status: FeedbackStatus) => {
    if (!adminToken) return;
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status,
              statusLabel: FEEDBACK_STATUSES.find((s) => s.value === status)?.label ?? status,
            }
          : x,
      ),
    );
    try {
      const res = await fetch("/api/update-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminToken,
        },
        body: JSON.stringify({ id, status }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "更新失败");
      toast.success("状态已更新");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
      void refresh();
    }
  };

  const saveRemark = async (id: string, remark: string) => {
    if (!adminToken) return false;
    try {
      const res = await fetch("/api/update-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminToken,
        },
        body: JSON.stringify({ id, remark }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "保存失败");
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, remark } : x)));
      toast.success("备注已保存");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
      return false;
    }
  };

  const remove = async (id: string) => {
    if (!adminToken) return;
    if (!confirm("确认删除该条反馈？将同时从飞书表格移除。")) return;
    try {
      const res = await fetch("/api/delete-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminToken,
        },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "删除失败");
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("已删除");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm rounded-sm bg-secondary/60 p-8">
            <h1 className="text-xl font-bold text-foreground">管理员登录</h1>
            <p className="mt-2 text-sm text-muted-foreground">登录后可查看、筛选并跟进权益反馈。</p>
            <div className="mt-6 space-y-2">
              <Label htmlFor="admin-pwd">管理员密码</Label>
              <Input
                id="admin-pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="请输入管理员密码"
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={!pwd.trim() || logggingIn}
              className="mt-5 h-11 w-full rounded-full"
            >
              {logggingIn ? "登录中…" : "登录"}
            </Button>
          </form>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/70">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <p className="text-xs font-bold tracking-[0.28em] text-primary">ADMIN · 反馈管理</p>
            <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              权益反馈后台
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              数据实时同步自飞书多维表格。可筛选、调整状态、填写处理备注。
            </p>
          </div>
        </section>

        <VisitStatsSection adminToken={adminToken} refreshKey={refreshKey} />

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-10">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {FEEDBACK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 h-10">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              刷新
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">共 {items.length} 条</span>
          </div>

          <div className="mt-6 space-y-4">
            {loading && items.length === 0 ? (
              <Empty text="加载中…" loading />
            ) : items.length === 0 ? (
              <Empty text="暂无匹配的反馈" />
            ) : (
              items.map((it) => (
                <FeedbackRow
                  key={it.id}
                  item={it}
                  adminToken={adminToken}
                  onStatus={updateStatus}
                  onRemark={saveRemark}
                  onDelete={remove}
                />
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/** ISO 时间 → 北京时间 YYYY-MM-DD HH:mm */
function beijingTimeText(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const t = new Date(d.getTime() + 8 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())} ` +
    `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`
  );
}

/**
 * 访问统计：展示总访问量 / 独立访客 / 今日与近 7 日数据、14 天趋势与热门页面。
 * 数据来自 /api/visit-stats（R2 上的轻量计数器）。
 */
function VisitStatsSection({
  adminToken,
  refreshKey,
}: {
  adminToken: string | null;
  refreshKey: number;
}) {
  const [stats, setStats] = useState<VisitStatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/visit-stats?days=14", {
        headers: { "X-Admin-Password": adminToken },
      });
      if (res.status === 401) throw new Error("管理员登录已失效，请重新登录");
      const json = (await res.json().catch(() => null)) as VisitStatsResponse | null;
      if (!json?.ok || !json.stats) {
        throw new Error(json?.error ?? `读取失败（HTTP ${res.status}）`);
      }
      setStats(json.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取失败");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const daily = stats?.daily ?? [];
  const peak = Math.max(1, ...daily.map((d) => d.pageviews));
  const blocks = [
    {
      label: "总访问量",
      icon: Eye,
      value: stats?.totalPageviews ?? 0,
      note: "统计开启以来累计页面浏览",
      theme: "bg-primary text-primary-foreground border-transparent",
      accent: "text-accent",
    },
    {
      label: "独立访客",
      icon: Users,
      value: stats?.totalVisitors ?? 0,
      note: "按浏览器去重，不记录个人信息",
      theme: "bg-background text-foreground border-border/70",
      accent: "text-primary",
    },
    {
      label: "今日访问",
      icon: BarChart3,
      value: stats?.todayPageviews ?? 0,
      note: `今日访客 ${stats?.todayVisitors ?? 0} 人`,
      theme: "bg-background text-foreground border-border/70",
      accent: "text-primary",
    },
    {
      label: "近 7 日访问",
      icon: CalendarDays,
      value: stats?.weekPageviews ?? 0,
      note: `近 7 日访客 ${stats?.weekVisitors ?? 0} 人次`,
      theme: "bg-secondary text-foreground border-transparent",
      accent: "text-primary",
    },
  ];

  return (
    <section className="border-b border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.28em] text-primary">VISITS · 访问统计</p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              浏览访问人数
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {stats?.updatedAt && (
              <span className="text-xs text-muted-foreground">
                更新于 {beijingTimeText(stats.updatedAt)}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
              )}
              刷新
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-sm border border-dashed border-border bg-background/70 px-5 py-6">
            <p className="text-sm font-semibold text-foreground">暂时读不到访问统计</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              请确认已配置 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY /
              R2_BUCKET_NAME。
            </p>
          </div>
        ) : !stats ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在读取访问统计…
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {blocks.map((b) => (
                <div
                  key={b.label}
                  className={`flex min-h-32 flex-col justify-between gap-6 rounded-sm border p-6 ${b.theme}`}
                >
                  <p
                    className={`font-display text-4xl font-black leading-none tracking-tight ${b.accent}`}
                  >
                    {b.value.toLocaleString("zh-CN")}
                  </p>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      <b.icon className="h-3.5 w-3.5 opacity-70" />
                      {b.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed opacity-80">{b.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-sm border border-border/70 bg-background p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-foreground">近 14 天访问趋势</p>
                <p className="text-xs text-muted-foreground">柱高表示当日访问量（PV）</p>
              </div>
              <div className="mt-5 flex items-end gap-1.5 sm:gap-2">
                {daily.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date} 访问 ${d.pageviews} · 访客 ${d.visitors}`}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {d.pageviews || ""}
                    </span>
                    <div className="flex h-24 w-full items-end overflow-hidden rounded-sm bg-secondary/70">
                      <div
                        className="w-full rounded-sm bg-primary transition-[height] duration-500"
                        style={{ height: `${Math.round((d.pageviews / peak) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      <span className="hidden sm:inline">{d.date.slice(5)}</span>
                      <span className="sm:hidden">{d.date.slice(8)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-border/70 bg-background p-5">
              <p className="text-sm font-bold text-foreground">热门页面</p>
              {stats.topPages.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">暂无数据</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {stats.topPages.map((p) => (
                    <li
                      key={p.path}
                      className="flex items-center gap-3 border-t border-border/70 pt-2 text-sm first:border-t-0 first:pt-0"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {p.path}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {p.pageviews.toLocaleString("zh-CN")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {stats.updatedAt === null && (
              <p className="mt-3 text-xs text-muted-foreground">
                尚未记录到访问：访客打开任意页面后，这里会自动开始累计。
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Empty({ text, loading }: { text: string; loading?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border py-16 text-muted-foreground">
      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Inbox className="h-8 w-8" />}
      <p className="text-sm">{text}</p>
    </div>
  );
}

function FeedbackRow({
  item,
  adminToken,
  onStatus,
  onRemark,
  onDelete,
}: {
  item: FeedbackView;
  adminToken: string | null;
  onStatus: (id: string, status: FeedbackStatus) => void;
  onRemark: (id: string, remark: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remark, setRemark] = useState(item.remark);

  const save = async () => {
    setSaving(true);
    const ok = await onRemark(item.id, remark);
    setSaving(false);
    if (!ok) setRemark(item.remark);
  };

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="font-mono text-sm font-semibold text-foreground">{item.ticket}</span>
        <Badge variant={statusVariant(item.status)}>{item.statusLabel}</Badge>
        <Badge variant="outline">{item.categoryLabel}</Badge>
        {item.attachments.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Paperclip className="h-3 w-3" />
            {item.attachments.length}
          </Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">提交 {item.createdAtText}</span>
        <Select value={item.status} onValueChange={(v) => onStatus(item.id, v as FeedbackStatus)}>
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? "收起" : "查看"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t border-border px-4 py-4 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="text-sm">
              <span className="text-muted-foreground">发生时间：</span>
              <span className="text-foreground">{item.occurredAtText || "—"}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">联系方式：</span>
              <span className="font-mono text-foreground">{maskPhone(item.contact)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">姓名：</span>
              <span className="text-foreground">{maskName(item.name)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">校区：</span>
              <span className="text-foreground">{item.campus || "—"}</span>
            </div>
            <div className="rounded-sm bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
              {item.detail || "（无描述）"}
            </div>
            {item.attachments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">附件</p>
                <ul className="space-y-1.5">
                  {item.attachments.map((a, i) => (
                    <li key={`${a.link}-${i}`}>
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1.5 truncate text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{a.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">处理备注</Label>
            <div className="flex h-full flex-col gap-2">
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="记录处理进度、回复内容等…"
                className="min-h-24 flex-1 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={save}
                  disabled={saving || remark === item.remark}
                  className="h-9"
                >
                  {saving ? "保存中…" : "保存备注"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
