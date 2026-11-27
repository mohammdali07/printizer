import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function InfiniteMobileSlider({
  items = [],
  renderItem,
  autoPlayMs = 3500,
  prevLabel = 'Previous',
  nextLabel = 'Next'
}) {
  const count = items.length;
  const [trackIdx, setTrackIdx] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Build [last, ...items, first] for seamless forward/backward infinite looping
  const extendedItems = count > 1
    ? [items[count - 1], ...items, items[0]]
    : items;

  const activeDot = count > 0 ? ((trackIdx - 1) % count + count) % count : 0;

  const goNext = () => {
    if (count <= 1) return;
    setAnimate(true);
    setTrackIdx((prev) => (prev >= count + 1 ? count + 1 : prev + 1));
  };

  const goPrev = () => {
    if (count <= 1) return;
    setAnimate(true);
    setTrackIdx((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  const jumpTo = (dotIdx) => {
    setAnimate(true);
    setTrackIdx(dotIdx + 1);
  };

  const handleTransitionEnd = () => {
    if (count <= 1) return;
    if (trackIdx === count + 1) {
      setAnimate(false);
      setTrackIdx(1);
    } else if (trackIdx === 0) {
      setAnimate(false);
      setTrackIdx(count);
    }
  };

  useEffect(() => {
    if (paused || count <= 1 || !autoPlayMs) return;
    const timer = setInterval(goNext, autoPlayMs);
    return () => clearInterval(timer);
  }, [paused, count, autoPlayMs]);

  if (count === 0) return null;

  return (
    <div
      className="relative"
      onTouchStart={(e) => {
        setPaused(true);
        touchStartXRef.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const startX = touchStartXRef.current;
        if (startX !== null) {
          const diff = startX - e.changedTouches[0].clientX;
          if (diff > 40) goNext();
          else if (diff < -40) goPrev();
        }
        touchStartXRef.current = null;
        setTimeout(() => setPaused(false), 2000);
      }}
    >
      <div className="overflow-hidden py-2">
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex ${animate ? 'transition-transform duration-500 ease-out' : 'transition-none'}`}
          style={{ transform: `translateX(-${(count > 1 ? trackIdx : 0) * 100}%)` }}
        >
          {extendedItems.map((item, idx) => (
            <div key={`${item.id || idx}-${idx}`} className="w-full shrink-0 px-1">
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={prevLabel}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-slate-200 bg-white/95 backdrop-blur-sm text-slate-700 shadow-lg flex items-center justify-center cursor-pointer active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={nextLabel}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-slate-200 bg-white/95 backdrop-blur-sm text-slate-700 shadow-lg flex items-center justify-center cursor-pointer active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center space-x-1.5 pt-3">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => jumpTo(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeDot === idx
                    ? 'w-5 h-1.5 bg-brand-crimson shadow-sm'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
