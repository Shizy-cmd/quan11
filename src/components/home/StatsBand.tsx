import { useReveal } from "@/hooks/use-reveal";

const stats = [
  { value: "24", label: "新生必看问答", note: "覆盖六大篇章" },
  { value: "17", label: "校园指南板块", note: "政策文件一站查阅" },
  { value: "92%", label: "反馈满意度", note: "六月回访统计" },
  { value: "79", label: "六月办结反馈", note: "平均 4.2 天处理" },
];

const BLOCK_THEMES = [
  { card: "bg-primary text-primary-foreground", value: "text-brand-gold" },
  { card: "bg-brand-red text-white", value: "text-white" },
  { card: "bg-brand-gold text-primary", value: "text-primary" },
  { card: "bg-brand-cyan text-primary", value: "text-primary" },
] as const;

export function StatsBand() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="reveal grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-primary">
              <span aria-hidden="true" className="inline-block h-3.5 w-1 bg-accent" />
              工作数据
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
              权益中心在行动
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9">
            每一个数字背后，都是一件被认真对待的校园权益事。
          </p>
        </div>

        <div className="reveal reveal-delay-1 mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const theme = BLOCK_THEMES[i % BLOCK_THEMES.length];
            return (
              <div
                key={s.label}
                className={`flex min-h-56 flex-col justify-between gap-8 rounded-sm p-7 ${theme.card}`}
              >
                <p
                  className={`font-display text-6xl font-bold leading-none sm:text-7xl ${theme.value}`}
                >
                  {s.value}
                </p>
                <div>
                  <p className="text-base font-bold">{s.label}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-85">{s.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
