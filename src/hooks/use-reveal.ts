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
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const observeAll = () => {
      root
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((t) => observer.observe(t));
    };

    observeAll();

    // Re-observe any .reveal elements added later (e.g. content loaded
    // after mount) so they don't stay stuck at opacity 0.
    const mo = new MutationObserver(() => observeAll());
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return ref;
}
