import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ExternalLink, ArrowRight, PenLine, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import { guideItemCount, type GuideItem } from "@/lib/freshmanGuide";
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
          "新生指北：HDUer 的第一颗纽扣、住在杭电、学在杭电、吃在杭电、行在杭电与附录六大篇章，覆盖账号认证、报到、宿舍、选课、食堂、快递、奖助学金等新生内容，由学长学姐整理并人工审核。",
      },
      { property: "og:title", content: "新生指北 | 学生权益中心" },
      {
        property: "og:description",
        content: "六大篇章，从第一颗纽扣到校园日常，新生必看的杭电指北。",
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
  const ref = useReveal<HTMLDivElement>();
  const { chapters, updateItem, removeImage, reset, saveToServer, saving } = useGuideData();
  const { isAdmin } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));
  const totalItems = guideItemCount(chapters);

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="reveal flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">新生指北</span>
          </div>
          <h1 className="reveal reveal-delay-1 mt-4 font-display text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            新生指北
          </h1>
          <p className="reveal reveal-delay-2 mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {chapters.length} 个篇章、{totalItems} 个单元，从报到前的第一颗纽扣到校园日常，
            由学长学姐整理并人工审核。
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

      <main className="reveal mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-12">
          {/* 目录 · 左侧栏 */}
          <aside className="reveal lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              目录
            </p>
            <nav
              aria-label="篇章导航"
              className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {chapters.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary lg:rounded-lg lg:px-4 lg:py-2.5 lg:text-sm"
                >
                  <span className="text-muted-foreground">{c.numeral}</span>
                  {c.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* 篇章内容 */}
          <div className="mt-10 lg:mt-0">
            <div className="space-y-6">
              {chapters.map((chapter, ci) => (
                <section
                  key={chapter.id}
                  id={chapter.id}
                  className="reveal scroll-mt-24 border-t border-border/70 pt-8 sm:pt-10"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2">
                      {ci + 1}
                    </span>
                    <span className="uppercase tracking-wider">Chapter</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                    <span className="text-muted-foreground">{chapter.numeral}、</span>
                    {chapter.title}
                  </h2>
                  {chapter.intro && (
                    <p className="mt-1 text-sm text-muted-foreground">{chapter.intro}</p>
                  )}

                  <ul className="mt-6 divide-y divide-border/60">
                    {chapter.items.map((it) => (
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
                  </ul>
                </section>
              ))}
            </div>

            {/* CTA */}
            <div className="reveal mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row sm:items-center">
              <div>
                <p className="text-base font-semibold text-foreground">还有问题没被解答？</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  告诉我们，我们会把高频问题补充进新生指北。
                </p>
              </div>
              <Link to="/feedback">
                <Button className="rounded-full font-bold">
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
      <li className="py-4">
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
      </li>
    );
  }

  return (
    <li>
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
                {item.content
                  ?.split("\n\n")
                  .filter((p) => p.trim())
                  .map((paragraph, i) => (
                    <p
                      key={i}
                      className="mt-3 text-sm leading-relaxed text-muted-foreground first:mt-0"
                    >
                      {paragraph}
                    </p>
                  ))}
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
    </li>
  );
}
