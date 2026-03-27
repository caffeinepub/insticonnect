import { useRef, useState } from "react";

interface PostCarouselProps {
  images: string[];
}

export default function PostCarousel({ images }: PostCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="w-full aspect-[4/3] overflow-hidden">
        <img
          src={images[0]}
          alt="post"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40 && current < images.length - 1) setCurrent((c) => c + 1);
    else if (delta > 40 && current > 0) setCurrent((c) => c - 1);
    isDragging.current = false;
  };

  return (
    <div
      className="w-full aspect-[4/3] overflow-hidden relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          width: `${images.length * 100}%`,
        }}
      >
        {images.map((img) => (
          <div
            key={img}
            className="h-full flex-shrink-0"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={img}
              alt="post frame"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Counter badge */}
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
        {current + 1}/{images.length}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Go to image ${i + 1}`}
            className="rounded-full transition-all duration-200"
            style={{
              width: i === current ? 8 : 6,
              height: i === current ? 8 : 6,
              background: i === current ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
