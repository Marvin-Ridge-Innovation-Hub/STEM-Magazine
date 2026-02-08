'use client';

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const Heading: React.FC<HeadingProps> = ({ title, subtitle, center }) => {
  return (
    <div className={center ? 'text-center' : 'text-start'}>
      <div className="font-display text-2xl sm:text-3xl leading-tight tracking-tight">
        {title}
      </div>
      <div className="font-light text-(--muted-foreground) mt-2">
        {subtitle}
      </div>
    </div>
  );
};

export default Heading;
