import { Link } from "@tanstack/react-router";
import hdsuLogo from "@/assets/hdsu-logo.jpg";
import waterLilies from "@/assets/user-paintings/0b2bf71a2ed2e93a9b9da67338d5da13.jpg";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden text-primary-foreground">
      <img
        src={waterLilies}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover blur-[1px]"
      />
      <div className="absolute inset-0 bg-primary/75" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={hdsuLogo}
                alt="学生会 Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="leading-none">
                <p className="text-base font-black tracking-tight">学生权益中心</p>
                <p className="mt-1 text-[11px] tracking-[0.18em] text-primary-foreground/80">
                  杭州电子科技大学校学生会
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
                  新生答疑
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

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-background/15 pt-6 text-xs text-primary-foreground/80 sm:flex-row sm:items-center">
          <p>© 2026 学生会学生权益中心 · 备案信息占位</p>
          <p>全心权益 · 全意为你</p>
        </div>
      </div>
    </footer>
  );
}
