import React, { useState, useEffect, useMemo } from 'react';
import { ImageIcon } from 'lucide-react';

export interface ImageOptimizedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  srcSet?: string;
  priority?: boolean;
  aspectRatio?: string;
  fallbackSrc?: string;
  placeholderColor?: string;
  showSkeleton?: boolean;
  quality?: number;
}

/**
 * Utility to generate responsive srcset for Unsplash images or high-res photography
 */
export function generateResponsiveSrcSet(src: string, quality: number = 80): string | undefined {
  if (!src) return undefined;

  // Check if it is an Unsplash image URL
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', String(quality));

      const widths = [360, 480, 720, 960, 1200, 1600];
      return widths
        .map((w) => {
          const u = new URL(url.toString());
          u.searchParams.set('w', String(w));
          return `${u.toString()} ${w}w`;
        })
        .join(', ');
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export const ImageOptimized: React.FC<ImageOptimizedProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  srcSet,
  priority = false,
  aspectRatio,
  fallbackSrc = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  placeholderColor = 'bg-slate-800',
  showSkeleton = true,
  quality = 80,
  loading,
  decoding,
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Compute automatic or provided srcset
  const computedSrcSet = useMemo(() => {
    if (srcSet) return srcSet;
    return generateResponsiveSrcSet(currentSrc, quality);
  }, [srcSet, currentSrc, quality]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
    if (onError) onError(e);
  };

  const effectiveLoading = loading || (priority ? 'eager' : 'lazy');
  const effectiveDecoding = decoding || 'async';

  return (
    <div
      className={`relative overflow-hidden ${placeholderColor} ${aspectRatio ? '' : 'w-full h-full'} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Animated loading skeleton */}
      {showSkeleton && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 animate-pulse" />
      )}

      {/* Fallback state when failed completely */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-slate-400 bg-slate-900/90 text-center">
          <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
          <span className="text-[10px] uppercase font-bold tracking-wider">{alt || 'Изображение недоступно'}</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          srcSet={computedSrcSet}
          sizes={sizes}
          alt={alt}
          loading={effectiveLoading}
          decoding={effectiveDecoding}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
          {...rest}
        />
      )}
    </div>
  );
};
