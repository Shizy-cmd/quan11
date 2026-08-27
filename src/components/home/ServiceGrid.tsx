import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageSquarePlus, BookOpen, Megaphone, MessagesSquare } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const services = [
  {
    no: "01",
    icon: MessageSquarePlus,
    title: "权益反馈",
    desc: "分类、地点、详情、附件一次提交，系统自动生成问题单号，权益中心全程跟进。",
    href: "/feedback",
  },
  {
    no: "02",
    icon: MessagesSquare,
    title: "新生答疑",
    desc: "报到、宿舍、选课、转专业、竞赛、防诈骗……学长学姐整理的新生必看问答。",
    href: "/qa",
  },
  {
    no: "03",
    icon: BookOpen,
    title: "校园指南",
    desc: "17 个板块覆盖政策文件、办事流程与常用平台，点击即可查看或下载。",
    href: "/guide",
  },
  {
    no: "04",
    icon: Megaphone,
    title: "权益公告",
    desc: "公告、政策更新、月度工作动态与处理公示统一发布，让权益事被看见、被追踪。",
    href: "/announcements",
  },
];

export function ServiceGrid() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="reveal grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What we do
            </p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              一站式校园权益服务
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9">
            反馈有回音、疑问有答案、办事有指南、动态有公告。四件事，一站完成。
          </p>
        </div>

        <div className="mt-14">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.no}
                className={`reveal ${i > 0 ? "reveal-delay-1" : ""} border-t border-border/70`}
              >
                <Link
                  to={s.href as "/feedback"}
                  className="group flex items-center gap-5 py-8 transition-colors sm:gap-8"
                >
                  <span className="w-14 shrink-0 font-display text-4xl font-black leading-none text-foreground/15 transition-colors duration-300 group-hover:text-primary sm:w-20 sm:text-5xl">
                    {s.no}
                  </span>
                  <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:flex">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                      {s.title}
                    </span>
                    <span className="mt-1.5 block max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {s.desc}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground" />
                </Link>
              </div>
            );
          })}
          <div className="border-t border-border/70" />
        </div>
      </div>
    </section>
  );
}
