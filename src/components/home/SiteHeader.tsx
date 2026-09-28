import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, LogOut, X, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import hdsuLogo from "@/assets/hdsu-su-logo.png";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "首页", to: "/" },
  { label: "权益反馈", to: "/feedback" },
  { label: "新生指北", to: "/qa" },
  { label: "校园指南", to: "/guide" },
  { label: "权益公告", to: "/announcements" },
];

export function SiteHeader() {
  const { isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* 藏青标语顶条 */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-xs font-semibold tracking-[0.28em]">让优秀成为一种习惯</span>
          <a
            href="https://www.hdu.edu.cn"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs text-primary-foreground/70 transition-colors hover:text-primary-foreground sm:block"
          >
            杭州电子科技大学官网
          </a>
        </div>
      </div>

      {/* 主导航 */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link to="/" className="group flex items-center gap-3">
              <img
                src={hdsuLogo}
                alt="杭州电子科技大学学生会"
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="hidden h-8 w-px bg-border sm:block" />
              <span className="hidden leading-none sm:block">
                <span className="block font-display text-[15px] font-bold tracking-wide text-primary">
                  学生权益中心
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  校学生会官方服务平台
                </span>
              </span>
            </Link>
          </div>

          <nav className="hidden flex-none items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "rounded-md px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {isAdmin && (
              <div className="hidden md:block">
                <div className="flex items-center gap-1">
                  <Link
                    to="/admin-feedback"
                    className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/30 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    反馈管理
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 text-foreground"
                    onClick={() => {
                      logout();
                      toast.success("已退出管理员");
                    }}
                  >
                    <LogOut className="mr-1 h-3.5 w-3.5" />
                    退出管理员
                  </Button>
                </div>
              </div>
            )}
            <button
              type="button"
              aria-label="打开菜单"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 校会四色条 */}
      <div className="brand-stripe" aria-hidden="true">
        <span className="bg-brand-red" />
        <span className="bg-brand-gold" />
        <span className="bg-brand-cyan" />
        <span className="bg-brand-purple" />
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "rounded-md px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground",
                }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin-feedback"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                反馈管理
              </Link>
            )}
            {isAdmin && (
              <div className="mt-2 border-t border-border pt-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    toast.success("已退出管理员");
                  }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  退出管理员
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
