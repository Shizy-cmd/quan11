import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, ArrowRight, ShieldCheck, Users } from "lucide-react";
import { FRESHMAN_GUIDE, chapterCount, type GuideItem } from "@/lib/freshmanGuide";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useReveal } from "@/hooks/use-reveal";
import waterLilies from "@/assets/user-paintings/22b07edad047348b403aa98d4f35806e.jpg";

export const Route = createFileRoute("/qa")({
  head: () => ({
    meta: [
      { title: "新生答疑 · 杭电新生指北 | 学生权益中心" },
      {
        name: "description",
        content:
          "杭电新生指北：开学准备、宿舍、生活、助学政策、附录五大篇章，报到、选课、食堂、快递、奖助学金等校园生活常见问题，由学长学姐整理并人工审核。",
      },
      { property: "og:title", content: "新生答疑 · 杭电新生指北 | 学生权益中心" },
      {
        property: "og:description",
        content: "开学准备、宿舍、生活、助学政策、附录，新生必看的校园指北。",
      },
    ],
  }),
  component: QAPage,
});

const TOTAL_ITEMS = FRESHMAN_GUIDE.reduce((n, c) => n + chapterCount(c), 0);

function QAPage() {
  const ref = useReveal<HTMLElement>();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main ref={ref} className="flex-1">
        {/* Header */}
        <section className="border-b border-border/70">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-20">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Freshman guide · 新生答疑
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 max-w-3xl font-display text-5xl font-black leading-[1.06] tracking-tight text-foreground sm:text-6xl">
              杭电新生指北
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              开学准备、宿舍、生活、助学政策、附录五大篇章，共 {TOTAL_ITEMS} 条。
              由学长学姐整理并人工审核，内容持续补充中。
            </p>
            <div className="reveal reveal-delay-3 mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                内容经人工审核
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-accent" />
                学长学姐真实经验
              </span>
            </div>
          </div>
        </section>

        {/* Chapter nav · 睡莲做文字底 */}
        <section className="relative overflow-hidden">
          <img
            src={waterLilies}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-[3px]"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="reveal flex flex-wrap justify-center gap-2">
              {FRESHMAN_GUIDE.map((c) => (
                <a
                  key={c.id}
                  href={`#chapter-${c.id}`}
                  className="rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/25"
                >
                  {c.title}
                  <span className="ml-1.5 text-xs opacity-70">{chapterCount(c)}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Chapters */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {FRESHMAN_GUIDE.map((chapter, ci) => (
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
}: {
  item: GuideItem;
  open: boolean;
  onToggle: () => void;
}) {
  const hasContent = Boolean(item.content);

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
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180 text-foreground" : ""
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
