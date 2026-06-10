"use client";

import PresentationSlideshow from "../../components/PresentationSlideshow";

const slides = Array.from({ length: 12 }, (_, i) => ({
  src: `/images/presentation-workers/${i + 1}.webp`,
  alt: `Slide ${i + 1}`,
  fallbackSrc: `/images/presentation-workers/${i + 1}.png`,
}));

export default function PresentationWorkersPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <PresentationSlideshow slides={slides} />
    </div>
  );
}
