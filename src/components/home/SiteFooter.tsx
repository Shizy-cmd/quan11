import hdsuLogo from "@/assets/hdsu-logo.jpg";
import quan11 from "@/assets/quan11.jpg";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img src={hdsuLogo} alt="学生会 Logo" className="h-10 w-10 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-bold text-foreground">杭州电子科技大学校学生会·学生权益中心</p>
                <p className="text-xs text-muted-foreground">全心权益，全意为你</p>
              </div>
              <img
                src={quan11}
                alt="权十一"
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
              让优秀成为一种习惯。学生权益中心致力于搭建学生与学校职能部门之间的沟通桥梁，
              为同学们提供便捷、透明、安全的权益反馈渠道。
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">联系我们</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>值班时间：周一至周五 8:00 – 17:30</li>
              <li>办公地点：学生活动中心北楼B203</li>
              <li>官方公众号：杭州电子科技大学校学生会</li>
              <li>权十一官方QQ：3041545372</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">友情链接</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li><a href="/guide" className="hover:text-foreground">校园指南</a></li>
              <li><a href="/announcements" className="hover:text-foreground">权益公告</a></li>
              <li><a href="/surveys" className="hover:text-foreground">权益调研</a></li>
              <li><a href="/academy" className="hover:text-foreground">权益科普学堂</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 学生会学生权益中心 · 备案信息占位
        </div>
      </div>
    </footer>
  );
}
