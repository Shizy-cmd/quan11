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
          ? { ...x, status, statusLabel: FEEDBACK_STATUSES.find((s) => s.value === status)?.label ?? status }
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
    if (!adminToken) return;
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
            <p className="mt-2 text-sm text-muted-foreground">
              登录后可查看、筛选并跟进权益反馈。
            </p>
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
            <p className="text-xs font-bold tracking-[0.28em] text-primary">
              ADMIN · 反馈管理
            </p>
            <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              权益反馈后台
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              数据实时同步自飞书多维表格。可筛选、调整状态、填写处理备注。
            </p>
          </div>
        </section>

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
            <span className="ml-auto text-sm text-muted-foreground">
              共 {items.length} 条
            </span>
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

function Empty({ text, loading }: { text: string; loading?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border py-16 text-muted-foreground">
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Inbox className="h-8 w-8" />
      )}
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
        <span className="font-mono text-sm font-semibold text-foreground">
          {item.ticket}
        </span>
        <Badge variant={statusVariant(item.status)}>{item.statusLabel}</Badge>
        <Badge variant="outline">{item.categoryLabel}</Badge>
        {item.attachments.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Paperclip className="h-3 w-3" />
            {item.attachments.length}
          </Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          提交 {item.createdAtText}
        </span>
        <Select
          value={item.status}
          onValueChange={(v) => onStatus(item.id, v as FeedbackStatus)}
        >
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
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
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
