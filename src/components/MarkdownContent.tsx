import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export default function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ children, ...props }) => {
            const href = typeof props.href === 'string' ? props.href : '';
            const isExternal = href.startsWith('http');
            return (
              <a
                {...props}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-(--primary) underline decoration-transparent hover:decoration-inherit transition-colors"
              >
                {children}
              </a>
            );
          },
          code: ({ children, className, ...props }) => {
            const isBlock = Boolean(
              className && className.includes('language-')
            );
            return (
              <code
                {...props}
                className={`rounded bg-(--muted) px-1.5 py-0.5 text-sm ${
                  isBlock ? 'block p-3 overflow-x-auto' : ''
                } ${className || ''}`}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
