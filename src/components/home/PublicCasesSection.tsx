const cases = [
  {
    category: "食堂餐饮",
    status: "已解决",
    title: "二食堂晚餐窗口排队时间过长",
    summary: "已与后勤沟通增开 2 个窗口，晚高峰平均等待时间由 15 分钟降至 6 分钟。",
    duration: "处理用时 5 天",
  },
  {
    category: "宿舍住宿",
    status: "已解决",
    title: "3 号宿舍楼公共洗衣机故障",
    summary: "已联系维保方更换 3 台设备，并建立每月巡检机制。",
    duration: "处理用时 3 天",
  },
  {
    category: "校园设施",
    status: "对接校方",
    title: "图书馆自习区照明偏暗",
    summary: "已向校方提交照明改造建议，预计暑期完成灯具更换。",
    duration: "跟进中",
  },
];

export function PublicCasesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-2xl font-bold text-foreground">权益处理公示</h2>
      <p className="mt-1 text-sm text-muted-foreground">让每一次反馈都有回音（内容已脱敏）</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cases.map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {c.category}
              </span>
              <span
                className={
                  c.status === "已解决"
                    ? "inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                    : "inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                }
              >
                {c.status}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
            <p className="mt-4 text-xs font-medium text-muted-foreground">{c.duration}</p>
          </div>
        ))}
      </div>
    </section>
  );
}