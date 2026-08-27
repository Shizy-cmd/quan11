import { useReveal } from "@/hooks/use-reveal";
import wheatField from "@/assets/user-paintings/6432b86eeeb01988813d1d04f06643af.jpg";

const stats = [
  { value: "24", label: "新生必看问答", note: "学长学姐人工审核" },
  { value: "17", label: "校园指南板块", note: "政策文件一站查阅" },
  { value: "92%", label: "反馈满意度", note: "六月回访统计" },
  { value: "79", label: "六月办结反馈", note: "平均 4.2 天处理" },
];

const BLOCK_THEMES = [
  { card: "bg-primary text-primary-foreground", value: "text-accent" },
  { card: "bg-secondary text-foreground", value: "text-primary" },
  { card: "bg-sage text-foreground", value: "text-primary" },
  { card: "bg-primary text-primary-foreground", value: "text-accent" },
] as const;

export function StatsBand() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-border/70">
      <img
        src={wheatField}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover blur-[2px]"
      />
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="reveal grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              By the numbers
            </p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
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
                  className={`font-display text-6xl font-black leading-none tracking-tight sm:text-7xl ${theme.value}`}
                >
                  {s.value}
                </p>
                <div>
                  <p className="text-base font-bold">{s.label}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-80">{s.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
