import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ExternalLink, ArrowRight, PenLine, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import { FRESHMAN_GUIDE, chapterCount, type GuideItem } from "@/lib/freshmanGuide";
import { useGuideData } from "@/lib/useGuide";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useReveal } from "@/hooks/use-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/qa")({
  head: () => ({
    meta: [
      { title: "新生指北 | 学生权益中心" },
      {
        name: "description",
        content:
          "新生指北：开学准备、宿舍、生活、助学政策、附录五大篇章，报到、选课、食堂、快递、奖助学金等校园生活常见问题，由学长学姐整理并人工审核。",
      },
      { property: "og:title", content: "新生指北 | 学生权益中心" },
      {
        property: "og:description",
        content: "开学准备、宿舍、生活、助学政策、附录，新生必看的校园指北。",
      },
    ],
  }),
  component: QAPage,
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function QAPage() {
  const ref = useReveal<HTMLElement>();
  const { chapters, updateItem, removeImage, reset, saveToServer, saving } = useGuideData();
  const { isAdmin } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main ref={ref} className="flex-1">
        {/* Header */}
        <section className="border-b border-border/70">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-20">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Freshman guide · 新生指北
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 max-w-3xl font-display text-5xl font-black leading-[1.06] tracking-tight text-foreground sm:text-6xl">
              新生指北
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              报到前的准备、宿舍与校园生活、助学政策、常见问题，新生需要的内容都按篇章整理在这里。
            </p>
          </div>
        </section>

        {/* 管理员编辑栏 */}
        {isAdmin && (
          <section className="border-b border-border/70 bg-muted/40">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <p className="text-xs font-medium text-muted-foreground">
                管理员：开启后可逐条编辑标题、正文与配图，内容保存在当前浏览器。
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={editMode ? "default" : "outline"}
                  className="h-9 rounded-full font-semibold"
                  onClick={() => setEditMode((v) => !v)}
                >
                  <PenLine className="mr-1 h-3.5 w-3.5" />
                  {editMode ? "完成编辑" : "编辑模式"}
                </Button>
                {editMode && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-full font-semibold"
                      disabled={saving}
                      onClick={async () => {
                        const ok = await saveToServer();
                        if (ok) toast.success("已保存并发布到服务器");
                        else toast.error("保存失败，请确认服务器与 R2 可用");
                      }}
                    >
                      <Save className="mr-1 h-3.5 w-3.5" />
                      {saving ? "保存中…" : "保存并发布"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-full"
                      onClick={() => {
                        if (confirm("确认清除本地编辑？恢复为当前线上/默认内容。")) reset();
                      }}
                    >
                      恢复默认
                    </Button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Chapter nav · 编辑式目录条 */}
        <section className="border-b border-border/70 bg-secondary/45">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <div className="reveal flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
              <div className="flex shrink-0 items-baseline gap-2.5">
                <span className="text-sm font-bold tracking-tight text-foreground">目录</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Contents
                </span>
              </div>
              <nav aria-label="章节导航" className="flex flex-wrap gap-2">
                {chapters.map((c, ci) => (
                  <a
                    key={c.id}
                    href={`#chapter-${c.id}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <span className="font-display text-[11px] font-black tabular-nums text-primary transition-colors group-hover:text-primary-foreground/70">
                      {String(ci + 1).padStart(2, "0")}
                    </span>
                    {c.title}
                    <span className="text-[11px] font-medium tabular-nums text-muted-foreground transition-colors group-hover:text-primary-foreground/70">
                      {chapterCount(c)}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </section>

        {/* Chapters */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {chapters.map((chapter, ci) => (
            <div key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-24">
              <div className={`reveal ${ci > 0 ? "mt-16" : ""}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Chapter {String(ci + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  {chapter.title}
                </h2>
                {chapter.intro && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {chapter.intro}
                  </p>
                )}
              </div>

              {chapter.groups.map((group, gi) => (
                <div
                  key={group.id}
                  className={`reveal ${gi === 0 ? "mt-10" : "mt-9"} ${gi > 0 ? "reveal-delay-1" : ""}`}
                >
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-foreground/60">
                    {group.title}
                  </h3>
                  <div className="mt-3">
                    {group.items.map((it) => (
                      <GuideRow
                        key={it.id}
                        item={it}
                        open={openId === it.id}
                        onToggle={() => toggle(it.id)}
                        editMode={editMode && isAdmin}
                        onTitle={(v) => updateItem(it.id, { title: v })}
                        onContent={(v) => updateItem(it.id, { content: v })}
                        onAddImage={async (file) => {
                          const url = await fileToDataUrl(file);
                          updateItem(it.id, { images: [...(it.images ?? []), url] });
                        }}
                        onRemoveImage={(idx) => removeImage(it.id, idx)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* CTA */}
          <div className="reveal mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-10 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-black text-foreground">还有问题没被解答？</p>
              <p className="mt-1 text-sm text-muted-foreground">
                告诉我们，我们会把高频问题补充进新生指北。
              </p>
            </div>
            <Link
              to="/feedback"
              className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_var(--color-moss)]"
            >
              去权益反馈提问
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function GuideRow({
  item,
  open,
  onToggle,
  editMode,
  onTitle,
  onContent,
  onAddImage,
  onRemoveImage,
}: {
  item: GuideItem;
  open: boolean;
  onToggle: () => void;
  editMode: boolean;
  onTitle: (value: string) => void;
  onContent: (value: string) => void;
  onAddImage: (file: File) => void;
  onRemoveImage: (index: number) => void;
}) {
  const hasContent = Boolean((item.content ?? "").trim());
  const images = item.images ?? [];

  if (editMode) {
    return (
      <div className="reveal border-t border-border/70 py-4">
        <div className="space-y-3">
          <Input
            value={item.title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="小单元标题"
            className="h-9 font-semibold"
          />
          <Textarea
            value={item.content ?? ""}
            onChange={(e) => onContent(e.target.value)}
            placeholder="填写正文内容（留空则前台显示「待补充」）"
            rows={3}
            className="resize-y text-sm"
          />
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="h-20 w-28 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveImage(i)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                  aria-label="删除图片"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label className="inline-flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <Plus className="h-4 w-4" />
              <span className="text-[11px]">添加图片</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onAddImage(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {!hasContent && (
            <p className="text-[11px] text-muted-foreground">未填写内容，前台会显示「待补充」。</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reveal border-t border-border/70">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-4 py-4 text-left"
      >
        <span className="min-w-0 flex-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {item.title}
        </span>
        {!hasContent && (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            待补充
          </span>
        )}
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-90 text-foreground" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5">
            {hasContent ? (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-full rounded-md object-cover sm:max-h-72"
                      />
                    ))}
                  </div>
                )}
                {item.sources && item.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                      来源：
                    </span>
                    {item.sources.map((src) =>
                      src.url ? (
                        <a
                          key={`${src.title}-${src.url}`}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                        >
                          {src.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span
                          key={src.title}
                          className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {src.title}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                这条内容正在整理中，后续会由权益中心补充上线。如果你有补充，欢迎通过反馈告诉我们。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
