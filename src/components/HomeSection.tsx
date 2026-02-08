import { cn } from '@/lib/utils';

type HomeSectionVariant = 'band' | 'split' | 'offset' | 'overlap';
type HomeSectionTone = 'light' | 'card' | 'navy';

interface HomeSectionProps {
  variant?: HomeSectionVariant;
  tone?: HomeSectionTone;
  flip?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}

const toneClasses: Record<HomeSectionTone, string> = {
  light: 'bg-[var(--background)]',
  card: 'bg-[var(--card)]',
  navy: 'bg-[var(--navy-ink)] text-white',
};

const variantClasses: Record<HomeSectionVariant, string> = {
  band: '',
  split: 'home-split',
  offset: 'home-offset',
  overlap: 'home-overlap',
};

export default function HomeSection({
  variant = 'band',
  tone = 'light',
  flip = false,
  className,
  innerClassName,
  children,
}: HomeSectionProps) {
  return (
    <section
      className={cn(
        'home-section home-full-bleed',
        toneClasses[tone],
        variantClasses[variant],
        flip && 'home-flip',
        className
      )}
    >
      <div className={cn('home-container', innerClassName)}>{children}</div>
    </section>
  );
}
