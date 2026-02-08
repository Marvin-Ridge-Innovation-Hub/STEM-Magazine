'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface HeroCarouselProps {
  images: string[];
  autoplayInterval?: number; // in milliseconds
  surfaceOpacity?: number; // 0-1
  overlayVariant?: 'subtle' | 'strong';
}

export default function HeroCarousel({
  images,
  autoplayInterval = 10000,
  surfaceOpacity = 0.24,
  overlayVariant = 'subtle',
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30,
    },
    [
      Autoplay({
        delay: autoplayInterval,
        stopOnInteraction: false,
      }),
    ]
  );

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Background Carousel */}
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0"
              style={{ height: '100%' }}
            >
              <Image
                src={image}
                alt={`Hero background ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
                quality={85}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Single surface overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--gradient-hero-surface)',
          opacity: surfaceOpacity,
        }}
      />
      {/* Mode-aware tint overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            overlayVariant === 'strong'
              ? 'var(--hero-overlay-strong)'
              : 'var(--hero-overlay)',
        }}
      />

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}
