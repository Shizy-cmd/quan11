import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Search,
  FileText,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  QrCode,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import {
  GUIDE_SECTIONS,
  type GuideLink,
  type GuideSection,
  type GuideGroup,
} from "@/lib/guideData";
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

/** 生成一个稳定的"频道"字符串作为板块字段值。 */
function channelKey(sectionId: string, groupTitle: string) {
  return `${sectionId}::${groupTitle}`;
}

function GuidePage() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/get-files");
      const json = (await res.json()) as { ok: boolean; items?: RemoteFile[] };
      setFiles(json.items ?? []);
    } catch {
      setFiles([]);
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
    return GUIDE_SECTIONS.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true;
      if (s.desc?.toLowerCase().includes(q)) return true;
      return (
        s.groups?.some(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.links.some((l) => l.label.toLowerCase().includes(q)) ||
            g.subgroups?.some(
              (sg) =>
                sg.title.toLowerCase().includes(q) ||
                sg.links.some((l) => l.label.toLowerCase().includes(q)),
            ),
        ) ?? false
      );
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">校园指南</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            校园指南
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            17 个板块，覆盖政策文件、办事流程与常用平台。点击链接即可查看或下载对应 PDF。
          </p>

          <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索板块、文件名，如「转专业」「国家奖学金」"
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {query && (
              <Button
                variant="ghost"
                onClick={() => setQuery("")}
                className="rounded-xl"
              >
                清空
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            板块导航
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GUIDE_SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span className="text-muted-foreground">{i + 1}.</span>
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-foreground">
              没有匹配的板块
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              换一个关键词试试。
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((s, i) => (
              <SectionBlock
                key={s.id}
                section={s}
                index={i + 1}
                files={files}
                loadingFiles={loadingFiles}
                onChanged={refresh}
              />
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-base font-semibold text-foreground">
              没找到你需要的文件？
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              提交反馈告诉我们，或联系学生权益中心补充最新文件。
            </p>
          </div>
          <Link to="/feedback">
            <Button className="rounded-full">
              去提交反馈
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
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
  onChanged,
}: {
  section: GuideSection;
  index: number;
  files: RemoteFile[];
  loadingFiles: boolean;
  onChanged: () => void | Promise<void>;
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2">
              {index}
            </span>
            <span className="uppercase tracking-wider">Section</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
            {section.title}
          </h2>
          {section.desc && (
            <p className="mt-1 text-sm text-muted-foreground">{section.desc}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {section.kind === "map" ? (
          <MapBlock imageUrl={section.imageUrl} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {section.groups?.map((g) => (
              <GroupBlock
                key={g.title}
                sectionId={section.id}
                group={g}
                files={files}
                loadingFiles={loadingFiles}
                onChanged={onChanged}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GroupBlock({
  sectionId,
  group,
  files,
  loadingFiles,
  onChanged,
}: {
  sectionId: string;
  group: GuideGroup;
  files: RemoteFile[];
  loadingFiles: boolean;
  onChanged: () => void | Promise<void>;
}) {
  const { isAdmin } = useAuth();
  const ch = channelKey(sectionId, group.title);
  const uploaded = files.filter((f) => f.section === ch);

  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{group.title}</p>
        {isAdmin && !group.subgroups && (
          <AdminUpload channel={ch} onDone={onChanged} />
        )}
      </div>

      {group.subgroups ? (
        <div className="mt-4 space-y-4">
          {group.subgroups.map((sg) => {
            const sgCh = channelKey(sectionId, `${group.title}/${sg.title}`);
            const sgUploaded = files.filter((f) => f.section === sgCh);
            return (
              <div key={sg.title}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {sg.title}
                  </p>
                  {isAdmin && (
                    <AdminUpload channel={sgCh} onDone={onChanged} />
                  )}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {sg.links.map((l, idx) => (
                    <LinkRow key={`${sg.title}-${idx}`} link={l} />
                  ))}
                  {sgUploaded.map((f) => (
                    <UploadedRow
                      key={f.id}
                      file={f}
                      isAdmin={isAdmin}
                      onDone={onChanged}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {group.links.map((l, idx) => (
            <LinkRow key={`${group.title}-${idx}`} link={l} />
          ))}
          {loadingFiles ? null : uploaded.map((f) => (
            <UploadedRow
              key={f.id}
              file={f}
              isAdmin={isAdmin}
              onDone={onChanged}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminUpload({
  channel,
  onDone,
}: {
  channel: string;
  onDone: () => void | Promise<void>;
}) {
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
      // 1. 上传到 Vercel Blob（经后端）
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
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
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
      <div className="group flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm">
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
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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

function MapBlock({ imageUrl }: { imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <img
          src={imageUrl}
          alt="杭州电子科技大学校园地图"
          className="w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/60 p-10 text-center">
      <ImageIcon className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">校园地图待上传</p>
      <p className="text-xs text-muted-foreground">
        管理员上传地图后，将在此位置展示。
      </p>
    </div>
  );
}

function LinkRow({ link }: { link: GuideLink }) {
  const isPlaceholder = !link.href || link.href === "#";
  const Icon =
    link.type === "wechat"
      ? QrCode
      : link.type === "link"
        ? ExternalLink
        : FileText;

  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1 text-sm text-foreground group-hover:text-primary">
        {link.label}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {link.type === "wechat"
          ? "公众号"
          : link.type === "link"
            ? "链接"
            : "PDF"}
      </span>
    </>
  );

  if (isPlaceholder) {
    return (
      <li>
        <div
          className="group flex cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 opacity-70"
          title="文件待上传"
        >
          {content}
          <span className="ml-1 text-[10px] text-muted-foreground">待上传</span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
      >
        {content}
      </a>
    </li>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = Upload; // keep import to avoid lint churn if used later
