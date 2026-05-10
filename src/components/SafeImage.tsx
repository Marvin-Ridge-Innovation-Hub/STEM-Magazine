'use client';

import Image, { type ImageProps } from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type SafeImageProps = Omit<ImageProps, 'src' | 'alt' | 'onError'> & {
  src?: string | null;
  alt: string;
  fallbackClassName?: string;
  onError?: ImageProps['onError'];
};

const shouldBypassNextOptimizer = (src: string) =>
  src.includes('res.cloudinary.com') || src.includes('cloudinary.com');

export default function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  fill,
  unoptimized,
  onError,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]',
          fill && 'absolute inset-0 h-full w-full',
          fallbackClassName
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill={fill}
      unoptimized={unoptimized ?? shouldBypassNextOptimizer(src)}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
