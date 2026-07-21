import quan11 from "@/assets/quan11.jpg.asset.json";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, var(--hero-glow-blue) 0%, transparent 70%), radial-gradient(50% 45% at 85% 80%, var(--hero-glow-green) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            杭州电子科技大学学生会 · 学生权益中心
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            全心权益，
            <br />
            全意为你
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
            你的校园权益服务平台 | 反馈、查询、学习、参与，一站完成
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/feedback"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              我要反馈
            </a>
            <a
              href="/guide"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              查看校园指南
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            你的每一次反馈，都会被认真看见。
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative">
            <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-accent/60 blur-2xl" />
            <img
              src={quan11.url}
              alt="权十一 —— 学生权益中心 IP 形象"
              className="w-64 rounded-[2.5rem] border border-border bg-card object-cover shadow-lg sm:w-80"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground shadow-sm">
              权十一 · 我来听听
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}