import oilGreenfield from "@/assets/oil-greenfield.jpg";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden">
      <img
        src={oilGreenfield}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
      />
      <div className="absolute inset-0 bg-primary/55" />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <h1 className="font-art text-[clamp(3.25rem,13vw,8rem)] leading-[0.95] tracking-[-0.02em] text-primary-foreground">
          <span className="block">全心权益</span>
          <span className="block w-[calc(100%+16px)] text-right">
            全意<span className="text-accent">为你</span>
          </span>
        </h1>
        <p className="ml-auto mt-8 max-w-md text-right text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
          你的校园权益服务平台：有问题就来反馈，有疑问看新生答疑，
          办事流程查校园指南，最新动态看权益公告。
        </p>
      </div>
    </section>
  );
}
