"use client";

import { useEffect, useState } from "react";

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  isInView: boolean;
}

export default function Counter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  isInView,
}: CounterProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {current.toLocaleString()}
      {suffix}
    </span>
  );
}
