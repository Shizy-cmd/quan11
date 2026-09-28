import { Link } from "@tanstack/react-router";
import hdsuLogoWhite from "@/assets/hdsu-su-logo-white.png";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* 校会四色条 */}
      <div className="brand-stripe" aria-hidden="true">
        <span className="bg-brand-red" />
        <span className="bg-brand-gold" />
        <span className="bg-brand-cyan" />
        <span className="bg-brand-purple" />
      </div>

      {/* 标语水印背景 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="select-none whitespace-nowrap font-display text-[clamp(3.5rem,13vw,9.5rem)] font-bold tracking-[0.08em] text-primary-foreground/[0.07]">
          让优秀成为一种习惯
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={hdsuLogoWhite} alt="杭州电子科技大学学生会" className="h-10 w-auto" />
              <span className="hidden h-9 w-px bg-primary-foreground/25 sm:block" />
              <div className="hidden leading-none sm:block">
                <p className="text-base font-bold tracking-wide">学生权益中心</p>
                <p className="mt-1.5 text-[11px] text-primary-foreground/70">
                  校学生会官方服务平台
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
              全心权益，全意为你。权益中心致力于搭建学生与学校职能部门之间的沟通桥梁，
              让每一次反馈都有回音，让校园服务更透明。
            </p>
          </div>

          <div>
            <p className="text-sm font-bold">快捷入口</p>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
              <li>
                <Link to="/feedback" className="transition-colors hover:text-primary-foreground">
                  权益反馈
                </Link>
              </li>
              <li>
                <Link to="/qa" className="transition-colors hover:text-primary-foreground">
                  新生指北
                </Link>
              </li>
              <li>
                <Link to="/guide" className="transition-colors hover:text-primary-foreground">
                  校园指南
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  className="transition-colors hover:text-primary-foreground"
                >
                  权益公告
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold">联系我们</p>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
              <li>值班时间：周一至周五 8:00 – 17:30</li>
              <li>办公地点：学生活动中心北楼 B203</li>
              <li>官方公众号：杭州电子科技大学校学生会</li>
              <li>权十一官方 QQ：3041545372</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-primary-foreground/20 pt-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center">
          <p>© 2026 杭州电子科技大学校学生会 · 学生权益中心</p>
          <p className="font-display font-semibold tracking-[0.2em] text-primary-foreground">
            让优秀成为一种习惯
          </p>
        </div>
      </div>
    </footer>
  );
}
