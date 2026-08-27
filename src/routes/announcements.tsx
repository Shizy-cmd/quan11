import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Megaphone,
  Pin,
  ChevronRight,
  ArrowRight,
  Bell,
  FileText,
  Calendar,
  TrendingUp,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  X,
  Plus,
  Trash2,
  PinOff,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useContentStore, type Announcement } from "@/lib/store";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "权益公告 | 学生权益中心" },
      {
        name: "description",
        content: "查看学生权益中心最新公告、政策更新、月度工作动态与处理公示，让校园服务更透明。",
      },
      { property: "og:title", content: "权益公告 | 学生权益中心" },
      {
        property: "og:description",
        content: "最新公告、政策更新、工作动态、处理公示一站式查询。",
      },
    ],
  }),
  component: AnnouncementsPage,
});

type Category = {
  key: string;
  label: string;
  desc: string;
  icon: typeof Bell;
};

const CATEGORIES: Category[] = [
  { key: "all", label: "全部公告", desc: "浏览全部动态", icon: Sparkles },
  { key: "notice", label: "权益公告", desc: "调研、活动、征集", icon: Megaphone },
  { key: "policy", label: "政策更新", desc: "校规、流程调整", icon: ShieldCheck },
  { key: "work", label: "工作动态", desc: "月报、复盘、进展", icon: TrendingUp },
  { key: "case", label: "处理公示", desc: "已办结案例公示", icon: ClipboardList },
];

const EDITABLE_CATS = CATEGORIES.filter((c) => c.key !== "all");

function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement, togglePin } = useContentStore();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((a) => {
      const okCat = active === "all" || a.category === active;
      if (!okCat) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    });
  }, [announcements, query, active]);

  const pinned = useMemo(() => announcements.filter((a) => a.pinned), [announcements]);

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      notice: announcements.filter((a) => a.category === "notice").length,
      policy: announcements.filter((a) => a.category === "policy").length,
      work: announcements.filter((a) => a.category === "work").length,
      cases: announcements.filter((a) => a.category === "case").length,
    };
  }, [announcements]);

  const openItem = openId ? (announcements.find((a) => a.id === openId) ?? null) : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">权益公告</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </span>
              <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                权益公告
              </h1>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowComposer(true)} className="rounded-full font-bold">
                <Plus className="mr-1 h-4 w-4" />
                发布公告
              </Button>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            公告、政策、月报、处理公示统一发布，让每一件权益事都能被看见、被追踪。
          </p>

          <form
            className="mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索公告标题、关键词"
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" className="rounded-full font-bold">
              搜索
            </Button>
          </form>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="公告总数" value={stats.total} icon={Bell} />
            <StatCard label="政策更新" value={stats.policy} icon={ShieldCheck} />
            <StatCard label="工作月报" value={stats.work} icon={TrendingUp} />
            <StatCard label="处理公示" value={stats.cases} icon={ClipboardList} />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Pinned */}
      {active === "all" && !query && pinned.length > 0 && (
        <section id="pinned" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">置顶公告</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {pinned.map((a) => (
              <button
                key={a.id}
                onClick={() => setOpenId(a.id)}
                className="group flex h-full flex-col rounded-sm bg-secondary/60 p-6 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                    <Pin className="h-3 w-3" /> 置顶
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                    {labelOf(a.category)}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {a.summary}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {a.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    查看详情 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* List */}
      <section id="list" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {active === "all" ? "全部公告" : CATEGORIES.find((c) => c.key === active)?.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              共 {filtered.length} 条{query ? ` · 搜索「${query}」` : ""}
            </p>
          </div>
          {(query || active !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setActive("all");
              }}
              className="text-sm text-primary hover:underline"
            >
              重置筛选
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-foreground">没有找到相关公告</p>
            <p className="mt-1 text-xs text-muted-foreground">换一个关键词或分类试试。</p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border/70">
            {filtered.map((a) => (
              <li key={a.id} className="group">
                <div className="flex items-start gap-4 px-5 py-5 transition-colors hover:bg-secondary/40 sm:px-6">
                  <button
                    onClick={() => setOpenId(a.id)}
                    className="flex flex-1 items-start gap-4 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Megaphone className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                          {labelOf(a.category)}
                        </span>
                        {a.pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2 py-0.5 font-medium text-accent-foreground">
                            <Pin className="h-3 w-3" />
                            置顶
                          </span>
                        )}
                        <span className="text-muted-foreground">· {a.readingTime}</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold text-foreground group-hover:text-primary">
                        {a.title}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{a.summary}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {a.date}
                        </span>
                        <span>· {a.author}</span>
                      </div>
                    </div>
                  </button>
                  {isAdmin && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => {
                          togglePin(a.id);
                          toast.success(a.pinned ? "已取消置顶" : "已置顶");
                        }}
                        className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        title={a.pinned ? "取消置顶" : "置顶"}
                      >
                        {a.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`确认删除公告「${a.title}」？`)) {
                            deleteAnnouncement(a.id);
                            toast.success("公告已删除");
                          }
                        }}
                        className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />

      {/* Detail dialog */}
      {openItem && <DetailDialog item={openItem} onClose={() => setOpenId(null)} />}

      {/* Composer */}
      {showComposer && (
        <ComposerDialog
          onClose={() => setShowComposer(false)}
          onSubmit={(payload) => {
            addAnnouncement(payload);
            toast.success("公告已发布");
            setShowComposer(false);
          }}
        />
      )}
    </div>
  );
}

function labelOf(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Bell;
}) {
  return (
    <div className="rounded-sm bg-secondary/60 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function DetailDialog({ item, onClose }: { item: Announcement; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {labelOf(item.category)}
          </span>
          {item.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2 py-0.5 font-medium text-accent-foreground">
              <Pin className="h-3 w-3" />
              置顶
            </span>
          )}
        </div>
        <h2 className="mt-3 text-2xl font-bold text-foreground">{item.title}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {item.date} · {item.author} · 阅读 {item.readingTime}
        </p>
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-foreground/90">
          {item.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComposerDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: Omit<Announcement, "id" | "date">) => void;
}) {
  const [category, setCategory] = useState("notice");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [readingTime, setReadingTime] = useState("2 分钟");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      toast.error("请完整填写标题、摘要与正文");
      return;
    }
    const paragraphs = content
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      category,
      title: title.trim(),
      summary: summary.trim(),
      author: "学生权益中心",
      readingTime,
      pinned,
      content: paragraphs,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-8 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold text-foreground">发布新公告</h2>
        <p className="mt-1 text-xs text-muted-foreground">管理员操作 · 发布后即时对所有同学可见</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">分类</label>
            <div className="flex flex-wrap gap-2">
              {EDITABLE_CATS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === c.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：关于本学期食堂满意度调研的通知"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">摘要</label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="一句话说明本条公告"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              正文（每一段用空行分隔）
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder={"第一段...\n\n第二段..."}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">阅读时长</label>
              <Input
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                placeholder="2 分钟"
              />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              置顶该公告
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">发布</Button>
        </div>
      </form>
    </div>
  );
}
