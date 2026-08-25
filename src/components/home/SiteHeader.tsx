import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import hdsuLogo from "@/assets/hdsu-logo.jpg";
import quan11 from "@/assets/quan11.jpg";
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
  { label: "首页", href: "/" },
  { label: "权益公告", href: "/announcements" },
  { label: "权益反馈", href: "/feedback" },
  { label: "校园指南", href: "/guide" },
  { label: "进度查询", href: "/progress" },
  { label: "个人中心", href: "/me" },
];

const ROUTED = new Set(["/", "/feedback", "/guide", "/progress", "/me", "/announcements"]);

export function SiteHeader() {
  const { isAdmin, loginAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={hdsuLogo}
            alt="学生会 Logo"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">学生权益中心</p>
            <p className="text-[11px] text-muted-foreground">全心权益 · 全意为你</p>
          </div>
          <img
            src={quan11}
            alt="权十一"
            className="ml-1 hidden h-9 w-9 rounded-full border border-border object-cover sm:block"
          />
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) =>
              ROUTED.has(item.href) ? (
                <Link
                  key={item.href}
                  to={item.href as "/"}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "rounded-full px-4 py-2 text-sm font-medium bg-muted text-foreground" }}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="ml-2 hidden md:block">
            {isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
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
                className="rounded-full"
                onClick={() => setOpen(true)}
              >
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                管理员登录
              </Button>
            )}
          </div>
        </div>
      </div>

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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
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
