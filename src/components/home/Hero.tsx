import slogan from "@/assets/hdsu-su-slogan.png";
import { useReveal } from "@/hooks/use-reveal";

export function Hero() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-8 md:py-20">
        <div className="reveal">
          <p className="flex items-center gap-3 text-xs font-semibold text-primary">
            <span aria-hidden="true" className="inline-block h-4 w-1 bg-accent" />
            杭州电子科技大学学生会 · 学生权益中心
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.15] text-primary sm:text-6xl">
            全心权益
            <br />
            全意为你
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            校学生会官方服务平台：有问题就来反馈，有疑问看新生指北，
            办事流程查校园指南，最新动态看权益公告。
          </p>
        </div>

        <div className="reveal reveal-delay-1 flex justify-center md:justify-end">
          <img src={slogan} alt="让优秀成为一种习惯" className="w-full max-w-md sm:max-w-lg" />
        </div>
      </div>
    </section>
  );
}
