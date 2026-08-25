import quan11 from "@/assets/quan11.jpg";

export function BrandBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card px-6 py-12 text-center sm:flex-row sm:gap-10 sm:px-12 sm:text-left">
        <img
          src={quan11}
          alt="权十一"
          className="h-28 w-28 shrink-0 rounded-3xl border border-border object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            权十一陪你一起守护校园权益
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            让校园服务更透明，让学生权益更有回音。从反馈到解决，我们全程跟进。
          </p>
        </div>
        <a
          href="/feedback"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:ml-auto"
        >
          立即反馈
        </a>
      </div>
    </section>
  );
}
