import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Renders a product photograph inside a stable aspect-ratio container.
 * Never falls back silently to another product's image; displays a clean studio placeholder instead.
 */
export default function ProductImage({
  src,
  alt = 'Print Product',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  eager = false,
  placeholderLabel = ''
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanSrc = typeof src === 'string' ? src.trim() : '';

  if (!cleanSrc || hasError) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/70 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-400 mb-2">
          <ImageOff className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-bold text-slate-600 line-clamp-1 max-w-[90%]">
          {placeholderLabel || alt}
        </span>
        <span className="text-[10px] font-medium text-slate-400 mt-0.5">
          Product Photo Unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setHasError(true)}
      className={`${imgClassName} ${className}`}
    />
  );
}
