import {
  MessageSquarePlus,
  ListChecks,
  BookOpen,
  Megaphone,
  Vote,
  UserRound,
} from "lucide-react";

const actions = [
  {
    icon: MessageSquarePlus,
    title: "我要反馈",
    desc: "在线提交权益问题，3 步完成",
    href: "/feedback",
  },
  {
    icon: ListChecks,
    title: "查看进度",
    desc: "问题单号追踪，处理全程可见",
    href: "/progress",
  },
  {
    icon: BookOpen,
    title: "校园指南",
    desc: "制度文件、办事流程一键查看",
    href: "/guide",
  },
  {
    icon: Megaphone,
    title: "权益公告",
    desc: "最新校园服务动态与政策更新",
    href: "/announcements",
  },
  {
    icon: Vote,
    title: "权益调研",
    desc: "你的声音，影响校园服务",
    href: "/surveys",
  },
  {
    icon: UserRound,
    title: "个人中心",
    desc: "你的校园服务专属空间",
    href: "/me",
  },
];

export function QuickActions() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-2xl font-bold text-foreground">快捷服务</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        有问题，就来这里反馈；有进度，就在这里查看。
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <a
            key={a.title}
            href={a.href}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <a.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}