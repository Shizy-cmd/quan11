import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { GUIDE_SECTIONS } from "@/lib/guideData";
import { useReveal } from "@/hooks/use-reveal";

const FEATURED_IDS = [
  "major-transfer",
  "scholarship",
  "postgrad-recommend",
  "map",
  "innovation",
  "sunshine-run",
];

const BLOCK_STYLES = [
  "bg-primary text-primary-foreground",
  "bg-sage text-foreground",
  "bg-secondary text-foreground",
  "bg-card text-foreground",
] as const;

export function GuideTeaser() {
  const ref = useReveal<HTMLElement>();
  const featured = FEATURED_IDS.map((id) => GUIDE_SECTIONS.find((s) => s.id === id)).filter(
    (s): s is (typeof GUIDE_SECTIONS)[number] => Boolean(s),
  );

  return (
    <section ref={ref} className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="reveal grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <h2 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              校园指南
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              17 个板块覆盖政策文件与办事流程，先挑几个最常用的入口，点击直达对应章节。
            </p>
          </div>
          <Link
            to="/guide"
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-foreground transition-colors hover:text-primary md:col-span-4 md:justify-self-end"
          >
            进入校园指南
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="reveal reveal-delay-1 mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {featured.map((s, i) => {
            const style = BLOCK_STYLES[i % BLOCK_STYLES.length];
            return (
              <Link
                key={s.id}
                to="/guide"
                hash={s.id}
                className={`group flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[3px] px-4 text-center transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${style}`}
              >
                <span className="font-display text-lg font-black leading-tight sm:text-xl">
                  {s.title}
                </span>
                {s.desc && <span className="text-xs leading-relaxed opacity-75">{s.desc}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
