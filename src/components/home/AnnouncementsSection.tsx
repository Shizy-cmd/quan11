import { Link } from "@tanstack/react-router";
import { ArrowRight, Pin, CalendarDays, Inbox } from "lucide-react";
import { useAnnouncements } from "@/lib/announcements";
import { useReveal } from "@/hooks/use-reveal";

export function AnnouncementsSection() {
  const ref = useReveal<HTMLElement>();
  const { items: announcements } = useAnnouncements();
  const recent = [...announcements]
    .sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 5);

  return (
    <section ref={ref} className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="reveal grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-primary">
              <span aria-hidden="true" className="inline-block h-3.5 w-1 bg-accent" />
              工作动态
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
              近期权益动态
            </h2>
          </div>
          <Link
            to="/announcements"
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-foreground transition-colors hover:text-primary md:col-span-4 md:col-start-9 md:justify-self-end"
          >
            查看全部公告
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10">
          {recent.length === 0 ? (
            <div className="reveal flex items-center gap-4 rounded-xl border border-dashed border-border bg-card px-5 py-8">
              <Inbox className="h-8 w-8 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">暂无公告</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  新的权益动态发布后会第一时间出现在这里。
                </p>
              </div>
            </div>
          ) : (
            recent.map((n, i) => (
              <Link
                key={n.id}
                to="/announcements"
                className={`reveal group flex items-center gap-5 py-5 transition-colors sm:gap-8 ${
                  i > 0 ? "border-t border-border/70" : ""
                }`}
              >
                <span className="hidden w-10 shrink-0 font-display text-xl font-bold leading-none text-foreground/25 transition-colors group-hover:text-primary sm:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {n.cover && (
                  <img
                    src={n.cover}
                    alt={n.title}
                    className="h-16 w-28 shrink-0 rounded-md object-cover sm:h-20 sm:w-40"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                        <Pin className="h-3 w-3" />
                        置顶
                      </span>
                    )}
                    <span className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {n.title}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{n.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:inline-flex">
                    <CalendarDays className="h-4 w-4" />
                    {n.date}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
