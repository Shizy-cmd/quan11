import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Search,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useReveal } from "@/hooks/use-reveal";
import { GUIDE_SECTIONS, type GuideSection } from "@/lib/guideData";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "校园指南 | 学生权益中心" },
      {
        name: "description",
        content:
          "转专业、培养方案、综测、奖助学金、推免、创新创业、学分替代、国际游学、阳光长跑等 17 类校园政策文件一站式查询。",
      },
      { property: "og:title", content: "校园指南 | 学生权益中心" },
      {
        property: "og:description",
        content: "17 大板块，覆盖政策文件、办事流程与常用平台。",
      },
    ],
  }),
  component: GuidePage,
});

type RemoteFile = { id: string; name: string; section: string; url: string };

/**
 * 判断一条飞书记录是否属于某个板块。
 * 兼容板块 id、板块名，以及旧格式 "板块id::分组名"。
 */
function fileInSection(fileSection: string, section: GuideSection) {
  return (
    fileSection === section.id ||
    fileSection === section.title ||
    fileSection.startsWith(`${section.id}::`)
  );
}

function GuidePage() {
  const ref = useReveal<HTMLDivElement>();
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [filesError, setFilesError] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  const refresh = async () => {
    setFilesError(false);
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/get-files");
      const json = (await res.json()) as { ok: boolean; items?: RemoteFile[] };
      if (!json.ok) throw new Error("接口返回失败");
      setFiles(json.items ?? []);
    } catch {
      setFiles([]);
      setFilesError(true);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUIDE_SECTIONS;
    return GUIDE_SECTIONS.filter(
      (s) => s.title.toLowerCase().includes(q) || s.desc?.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="reveal flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">校园指南</span>
          </div>
          <h1 className="reveal reveal-delay-1 mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
            校园指南
          </h1>
          <p className="reveal reveal-delay-2 mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            17 个板块，覆盖政策文件、办事流程与常用平台。点击链接即可查看或下载对应 PDF。
          </p>

          <div className="reveal reveal-delay-3 mt-8 flex max-w-2xl items-center gap-2 rounded-md border border-border bg-card p-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索板块，如「转专业」「奖助学金」"
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {query && (
              <Button variant="ghost" onClick={() => setQuery("")} className="rounded-xl">
                清空
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="reveal mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-12">
          {/* 板块导航 · 左侧栏 */}
          <aside className="reveal lg:sticky lg:top-28">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">板块导航</p>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary lg:rounded-lg lg:px-4 lg:py-2.5 lg:text-sm"
                >
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* 板块内容 */}
          <div className="mt-10 lg:mt-0">
            {sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-foreground">没有匹配的板块</p>
                <p className="mt-1 text-xs text-muted-foreground">换一个关键词试试。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((s, i) => (
                  <SectionBlock
                    key={s.id}
                    section={s}
                    index={i + 1}
                    files={files}
                    loadingFiles={loadingFiles}
                    filesError={filesError}
                    onRetry={() => void refresh()}
                    onChanged={refresh}
                    open={openId === s.id}
                    onToggle={() => toggle(s.id)}
                  />
                ))}
              </div>
            )}

            <div className="reveal mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row sm:items-center">
              <div>
                <p className="text-base font-semibold text-foreground">没找到你需要的文件？</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  提交反馈告诉我们，或联系学生权益中心补充最新文件。
                </p>
              </div>
              <Link to="/feedback">
                <Button className="font-bold">
                  去提交反馈
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionBlock({
  section,
  index,
  files,
  loadingFiles,
  filesError,
  onRetry,
  onChanged,
  open,
  onToggle,
}: {
  section: GuideSection;
  index: number;
  files: RemoteFile[];
  loadingFiles: boolean;
  filesError: boolean;
  onRetry: () => void;
  onChanged: () => void | Promise<void>;
  open: boolean;
  onToggle: () => void;
}) {
  const { isAdmin } = useAuth();
  const uploads = files.filter((f) => fileInSection(f.section, section));
  const hasMap = section.kind === "map" && Boolean(section.imageUrl);

  return (
    <section
      id={section.id}
      className={`reveal scroll-mt-28 rounded-md border bg-card transition-colors ${
        open ? "border-primary/40" : "border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
        <h2 className="min-w-0 flex-1 text-xl font-bold text-foreground sm:text-2xl">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="group flex w-full items-start gap-4 text-left"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <span
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-bold transition-colors ${
                    open ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {index}
                </span>
                <span className="tracking-[0.2em]">板块</span>
              </div>
              <span className="mt-2 block text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                {section.title}
              </span>
              {section.desc && (
                <span className="mt-1 block text-sm font-normal text-muted-foreground">
                  {section.desc}
                </span>
              )}
            </div>
            <span
              aria-hidden="true"
              className={`mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                open
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </span>
          </button>
        </h2>
        {isAdmin && <AdminUpload channel={section.id} onDone={onChanged} />}
      </div>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {hasMap ? (
              <div className="overflow-hidden">
                <img
                  src={section.imageUrl}
                  alt="杭州电子科技大学校园地图"
                  className="w-full object-contain"
                />
              </div>
            ) : null}

            {uploads.length > 0 ? (
              <ul className="divide-y divide-border/60">
                {uploads.map((f) => (
                  <UploadedRow key={f.id} file={f} isAdmin={isAdmin} onDone={onChanged} />
                ))}
              </ul>
            ) : loadingFiles ? (
              <p className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                文件加载中…
              </p>
            ) : filesError ? (
              <div className="rounded-md border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
                <p>文件列表加载失败，请检查网络后重试。</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 inline-flex h-8 items-center rounded-md border border-input bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  重新加载
                </button>
              </div>
            ) : !hasMap ? (
              <p className="rounded-md border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
                该板块暂无上传文件
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminUpload({ channel, onDone }: { channel: string; onDone: () => void | Promise<void> }) {
  const { adminToken } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    if (!adminToken) {
      toast.error("请先登录管理员");
      return;
    }
    setBusy(true);
    try {
      // 1. 上传到 Cloudflare R2（经后端）
      const fd = new FormData();
      fd.append("file", file, file.name);
      const upRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "X-Admin-Password": adminToken },
        body: fd,
      });
      const upJson = (await upRes.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };
      if (!upJson.ok || !upJson.url) {
        throw new Error(upJson.error ?? "上传失败");
      }
      const fileUrl = upJson.url;

      // 2. 写入飞书
      const addRes = await fetch("/api/add-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminToken,
        },
        body: JSON.stringify({
          name: file.name,
          section: channel,
          url: fileUrl,
        }),
      });
      const addJson = (await addRes.json()) as { ok: boolean; error?: string };
      if (!addJson.ok) throw new Error(addJson.error ?? "写入失败");

      toast.success("上传成功");
      await onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 gap-1 rounded-full px-2 text-xs"
        onClick={pick}
        disabled={busy}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        {busy ? "上传中" : "上传"}
      </Button>
    </>
  );
}

function UploadedRow({
  file,
  isAdmin,
  onDone,
}: {
  file: RemoteFile;
  isAdmin: boolean;
  onDone: () => void | Promise<void>;
}) {
  const { adminToken } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isPdf = /\.pdf(\?|$)/i.test(file.url);

  const doDelete = async () => {
    if (!adminToken) return;
    if (!confirm(`确认删除「${file.name}」？将同时移除云端文件。`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/delete-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminToken,
        },
        body: JSON.stringify({ id: file.id }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "删除失败");
      toast.success("已删除");
      await onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li>
      <div className="group flex items-center gap-2 px-1 py-2.5">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-2"
        >
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 text-sm text-foreground group-hover:text-primary">
            {file.name}
          </span>
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
            {isPdf ? "PDF" : "文件"}
          </span>
        </a>
        {isAdmin && (
          <button
            type="button"
            onClick={doDelete}
            disabled={deleting}
            className="text-muted-foreground transition-colors hover:text-destructive"
            title="删除"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </li>
  );
}
