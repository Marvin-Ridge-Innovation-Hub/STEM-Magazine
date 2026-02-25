import { isValidElement, type ReactNode } from 'react';
import katex from 'katex';
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
  const combinedClassName = ['markdown-content', className]
    .filter(Boolean)
    .join(' ');

  const renderMathBlock = (source: string) =>
    katex.renderToString(source, {
      displayMode: true,
      throwOnError: false,
      strict: 'ignore',
    });

  const getCodeElement = (children: ReactNode) => {
    const child = Array.isArray(children) ? children[0] : children;
    return isValidElement(child) ? child : null;
  };

  const getLanguage = (classNameValue?: string) => {
    const match = classNameValue?.match(/language-([\w-]+)/);
    return match?.[1]?.toLowerCase();
  };

  return (
    <div className={combinedClassName}>
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
          pre: ({ children, ...props }) => {
            const codeElement = getCodeElement(children);
            if (codeElement) {
              const codeProps = codeElement.props as {
                className?: string;
                children?: ReactNode;
              };
              const language = getLanguage(codeProps.className);
              if (language === 'math') {
                const source = String(codeProps.children ?? '').replace(
                  /\n$/,
                  ''
                );
                return (
                  <div
                    className="my-4 overflow-x-auto"
                    dangerouslySetInnerHTML={{
                      __html: renderMathBlock(source),
                    }}
                  />
                );
              }
            }

            return (
              <pre
                {...props}
                className="overflow-x-auto rounded bg-(--muted) p-3 text-sm"
              >
                {children}
              </pre>
            );
          },
          code: ({ children, className, ...props }) => {
            const language = getLanguage(className);
            if (language) {
              return (
                <code {...props} className={className || ''}>
                  {children}
                </code>
              );
            }

            return (
              <code
                {...props}
                className={`rounded bg-(--muted) px-1.5 py-0.5 text-sm ${
                  className || ''
                }`}
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
