import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credits',
  description:
    'Meet the team behind MRHS STEM Magazine and the students supporting the platform.',
  alternates: {
    canonical: '/credits',
  },
};

export default function CreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
