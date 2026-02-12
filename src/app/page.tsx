import ExploreTracksSection from '@/components/home/ExploreTracksSection';
import FAQSection from '@/components/home/FAQSection';
import HeroSection from '@/components/home/HeroSection';
import RecentPostsSection from '@/components/home/RecentPostsSection';
import { heroImages } from '@/components/home/home-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {heroImages.slice(0, 3).map((image, index) => (
        <link
          key={image}
          rel="preload"
          as="image"
          href={image}
          // @ts-ignore - Next.js specific attribute
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
      ))}

      <div className="flex flex-col items-center w-full">
        <HeroSection />
        <RecentPostsSection />
        <ExploreTracksSection />
        <FAQSection />
      </div>
    </>
  );
}
