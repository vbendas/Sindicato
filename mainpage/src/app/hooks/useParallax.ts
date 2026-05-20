"use client";

import { useEffect, useRef } from "react";

export function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current?.closest(".scroll-container") as HTMLElement;
    const section = ref.current?.closest(".snap-section") as HTMLElement;
    if (!container || !section || !ref.current) return;

    const handleScroll = () => {
      if (!ref.current || !section) return;
      
      const containerHeight = container.clientHeight;
      const containerRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      
      // Section's center relative to viewport center
      const sectionCenter = sectionRect.top - containerRect.top + sectionRect.height / 2;
      const viewportCenter = containerHeight / 2;
      const distanceFromCenter = sectionCenter - viewportCenter;
      
      // Apply parallax: when section is centered, offset = 0
      const offset = distanceFromCenter * speed;
      ref.current.style.transform = `translateY(${-offset}px)`;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return ref;
}
