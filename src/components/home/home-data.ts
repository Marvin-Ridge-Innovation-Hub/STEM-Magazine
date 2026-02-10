import type { LucideIcon } from 'lucide-react';
import { Headphones, Newspaper, Target } from 'lucide-react';

export interface PlatformRow {
  icon: LucideIcon;
  title: string;
  description: string;
  meta: string[];
  cta: string;
  topics: string[];
  postType: 'SM_EXPO' | 'SM_NOW' | 'SM_PODS';
}

export interface HeroModule {
  icon: LucideIcon;
  name: string;
  note: string;
  chipClass: string;
}

export const heroImages = [
  '/images/carouselimages/image.jpg',
  '/images/carouselimages/image2.jpg',
  '/images/carouselimages/image3.jpg',
  '/images/carouselimages/image4.jpg',
  '/images/carouselimages/image5.jpg',
  '/images/carouselimages/image6.jpg',
];

export const TOPIC_GROUPS = [
  {
    label: 'Engineering & Tech',
    tags: ['Technology', 'Engineering', 'Computer Science'],
  },
  {
    label: 'Sciences',
    tags: ['Biology', 'Chemistry', 'Physics'],
  },
  {
    label: 'Math & AI',
    tags: ['Mathematics', 'AI'],
  },
  {
    label: 'People & Planet',
    tags: ['Environment', 'Health'],
  },
];

export const PLATFORM_ROWS: PlatformRow[] = [
  {
    icon: Target,
    title: 'SM Expo',
    description:
      'A home for build logs, experiments, and project showcases. Students document their process and share what they learned.',
    meta: ['Project galleries', 'Build journals', 'Team highlights'],
    cta: 'Explore Expo',
    topics: ['Engineering', 'Technology', 'Physics', 'Environment'],
    postType: 'SM_EXPO',
  },
  {
    icon: Newspaper,
    title: 'SM Now',
    description:
      'Long-form writing and opinion pieces on STEM ideas that matter. Thoughtful takes, explainers, and student perspectives.',
    meta: ['Weekly features', 'Opinion + analysis', 'Student voices'],
    cta: 'Read SM Now',
    topics: ['Biology', 'Chemistry', 'Health', 'AI'],
    postType: 'SM_NOW',
  },
  {
    icon: Headphones,
    title: 'SM Pods',
    description:
      'Podcast episodes and interviews that go deeper into student work, competitions, and innovations across campus.',
    meta: ['Audio + video', 'Guest spotlights', 'Monthly drops'],
    cta: 'Listen to Pods',
    topics: ['Computer Science', 'Mathematics', 'AI', 'Technology'],
    postType: 'SM_PODS',
  },
];

export const PLATFORM_CARD_STYLES = [''];

export const HERO_METRICS = [
  { value: '10+', label: 'In-House Members' },
  { value: '3', label: 'Publishing tracks' },
  { value: '24-48h', label: 'Review window' },
];

export const HERO_MODULES: HeroModule[] = [
  {
    icon: Target,
    name: 'SM Expo',
    note: 'Projects with visuals and build logs.',
    chipClass: 'program-chip-expo',
  },
  {
    icon: Newspaper,
    name: 'SM Now',
    note: 'Articles and perspectives on STEM news.',
    chipClass: 'program-chip-now',
  },
  {
    icon: Headphones,
    name: 'SM Pods',
    note: 'Podcast episodes and discussions.',
    chipClass: 'program-chip-pods',
  },
];

export const NEWSLETTER_BENEFITS = [
  'Weekly highlights from all three programs',
  'New post alerts from student authors',
  'No spam, unsubscribe anytime',
];

export const FAQ_ITEMS = [
  {
    question: 'Who can submit?',
    answer:
      'Any student at Marvin Ridge High School can submit content to the magazine. Whether you have a science project, a tech article, or want to share your thoughts on current science or technology events, we welcome your contributions.',
  },
  {
    question: 'What types of content can I submit?',
    answer:
      'We accept three types of content: SM Expo for showcasing student projects with images, SM Now for written articles and opinion pieces on science or tech topics, and SM Pods for podcast-style video content via YouTube links.',
  },
  {
    question: 'How long does the approval process take?',
    answer:
      "Our moderation team typically reviews submissions within 24-48 hours. You'll receive an email notification once your submission has been approved or if any changes are requested.",
  },
  {
    question: 'Can I edit my submission after posting?',
    answer:
      'Once a submission is approved and published, it cannot be edited directly. However, you can contact our team through the contact form if you need to make corrections to a published post.',
  },
  {
    question: 'How do I get updates on new stories?',
    answer:
      'You can subscribe to our newsletter below to receive notifications when new stories are published. You can choose to receive updates for SM Expo projects, SM Now articles, SM Pods episodes, or all of them.',
  },
  {
    question: 'How do I participate in SM Pods?',
    answer:
      'Unfortunately, we do not accept direct submissions for SM Pods. Our moderation team is small, and having to validate every video submission would be challenging. If you are interested in participating, please contact our team to see how you can get involved in MRHS Computer Science Club, the managers of the podcast.',
  },
];
