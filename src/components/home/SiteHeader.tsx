import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShieldCheck, LogOut, X } from "lucide-react";
import { toast } from "sonner";
import hdsuLogo from "@/assets/hdsu-logo.jpg";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "首页", to: "/" },
  { label: "权益反馈", to: "/feedback" },
  { label: "新生答疑", to: "/qa" },
  { label: "校园指南", to: "/guide" },
  { label: "权益公告", to: "/announcements" },
];

export function SiteHeader() {
  const { isAdmin, loginAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.trim()) return;
    setLoading(true);
    const ok = await loginAdmin(pwd.trim());
    setLoading(false);
    if (ok) {
      toast.success("管理员登录成功");
      setOpen(false);
      setPwd("");
    } else {
      toast.error("密码错误");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary">
            <img
              src={hdsuLogo}
              alt="学生会 Logo"
              className="h-10 w-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-black tracking-tight text-foreground">
              学生权益中心
            </span>
            <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
              全心权益 · 全意为你
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className:
                  "rounded-full px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            {isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full border-foreground/20 px-4 text-foreground"
                onClick={() => {
                  logout();
                  toast.success("已退出管理员");
                }}
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                退出管理员
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full border-foreground/20 px-4 text-foreground"
                onClick={() => setOpen(true)}
              >
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                管理员登录
              </Button>
            )}
          </div>
          <button
            type="button"
            aria-label="打开菜单"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground",
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-3">
              {isAdmin ? (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    toast.success("已退出管理员");
                  }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  退出管理员
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setOpen(true);
                    setMobileOpen(false);
                  }}
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  管理员登录
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>管理员登录</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="password"
              placeholder="请输入管理员密码"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "验证中..." : "登录"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
