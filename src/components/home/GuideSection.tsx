import { FileText, Download } from "lucide-react";

const guides = [
  { title: "新生入学指南（2026 版）", category: "新生入学" },
  { title: "奖助学金申请流程一览", category: "奖助学金" },
  { title: "宿舍管理条例", category: "宿舍管理" },
  { title: "请假与外出流程说明", category: "办事流程" },
  { title: "选课与教务常见问题", category: "教学教务" },
  { title: "校园设施分布图", category: "校园设施" },
];

export function GuideSection() {
  return (
    <section className="bg-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">校园指南推荐</h2>
            <p className="mt-1 text-sm text-muted-foreground">一键查看校园办事信息</p>
          </div>
          <a href="/guide" className="text-sm font-medium text-primary hover:underline">
            进入校园指南 →
          </a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <a
              key={g.title}
              href="/guide"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{g.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{g.category}</p>
              </div>
              <Download className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
