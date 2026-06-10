"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  Share2,
} from "lucide-react";

interface Slide {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

interface PresentationSlideshowProps {
  slides: Slide[];
  autoPlayInterval?: number;
}

export default function PresentationSlideshow({
  slides,
  autoPlayInterval = 5000,
}: PresentationSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const controlsTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval>>(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;

  const goTo = useCallback(
    (index: number, dir: number) => {
      setDirection(dir);
      setCurrent(((index % total) + total) % total);
      setProgress(0);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Controls visibility
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return;

    progressTimer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setCurrent((c) => {
            setDirection(1);
            return (c + 1) % total;
          });
          return 0;
        }
        return p + 100 / (autoPlayInterval / 50);
      });
    }, 50);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [isPlaying, autoPlayInterval, total]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
        resetControlsTimer();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        resetControlsTimer();
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, resetControlsTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
      resetControlsTimer();
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sindicato — Workers Presentation",
          text: "Check out the Sindicato Workers Presentation",
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "50%" : "-50%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none overflow-hidden"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src={slides[current].src}
            alt={slides[current].alt}
            fill
            className="object-contain"
            priority={current === 0}
            sizes="100vw"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Controls overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 pointer-events-none"
        style={{ pointerEvents: showControls ? "auto" : "none" }}
      >
        {/* Left arrow */}
        <button
          onClick={() => {
            prev();
            resetControlsTimer();
          }}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all rounded-full backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => {
            next();
            resetControlsTimer();
          }}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all rounded-full backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-3 px-3 sm:px-6">
          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto h-0.5 bg-white/10 mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-white/50"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>

          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {/* Left: play/pause + counter */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  resetControlsTimer();
                }}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <span className="text-white/50 text-xs font-[family-name:var(--font-jetbrains)] tabular-nums">
                {current + 1} / {total}
              </span>
            </div>

            {/* Center: dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    goTo(i, i > current ? 1 : -1);
                    resetControlsTimer();
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === current
                      ? "bg-white w-4"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Right: share + fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copied && (
                <span className="text-white/40 text-xs font-[family-name:var(--font-jetbrains)]">
                  Copied!
                </span>
              )}
              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
