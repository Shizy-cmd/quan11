import { useEffect, useRef } from "react";

/**
 * Adds the `is-visible` class to matching elements once they enter the
 * viewport, powering the itscraft-style scroll-reveal transitions.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      root?.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // 已经滚过视口（位于视口上方）的元素不会再产生新的交集变化，
          // 需要立即显示：否则在水合完成前被划过的区块会一直停在 opacity:0。
          const passed = entry.boundingClientRect.bottom <= 0;
          if (entry.isIntersecting || passed) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const observeAll = () => {
      const pending = root.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
      pending.forEach((t) => observer.observe(t));
    };

    observeAll();

    // Re-observe any .reveal elements added later (e.g. content loaded
    // after mount) so they don't stay stuck at opacity 0.
    // 同时监听 class 变化：React 在状态变化后重写某个元素的 className 时，
    // 会把这里写入的 is-visible 一起覆盖掉，需要重新观察把它补回来。
    const mo = new MutationObserver(() => observeAll());
    mo.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return ref;
}
