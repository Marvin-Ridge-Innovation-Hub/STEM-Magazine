import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore STEM Projects & Articles',
  description:
    'Browse innovative STEM projects, insightful articles, and engaging podcasts created by students. Discover SM Expo projects, SM Now articles, and SM Pods episodes at MRHS STEM Magazine.',
  alternates: {
    canonical: '/posts',
  },
  keywords: [
    'STEM projects',
    'student articles',
    'STEM podcasts',
    'SM Expo',
    'SM Now',
    'SM Pods',
    'science projects',
    'technology articles',
    'engineering projects',
    'high school STEM',
  ],
  openGraph: {
    title: 'Explore STEM Projects & Articles | MRHS STEM Magazine',
    description:
      'Browse innovative STEM projects, articles, and podcasts created by students at MRHS STEM Magazine.',
  },
};

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
