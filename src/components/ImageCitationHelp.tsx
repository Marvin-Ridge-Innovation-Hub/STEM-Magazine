type ImageCitationHelpProps = {
  className?: string;
};

export default function ImageCitationHelp({
  className = '',
}: ImageCitationHelpProps) {
  return (
    <details
      className={`rounded-lg border border-(--border) bg-(--card) p-4 ${className}`}
    >
      <summary className="cursor-pointer text-sm font-semibold text-(--foreground)">
        How to credit images (required)
      </summary>
      <div className="mt-3 space-y-3 text-sm text-(--muted-foreground)">
        <div>
          <div className="font-semibold text-(--foreground)">
            Option 1: Original photo
          </div>
          <p>
            Select <strong>Original photo</strong>. We will display:
            <span className="block text-(--foreground) mt-1">
              Original Photo From Your Name
            </span>
            <span className="block mt-1">
              This links to your public profile on the magazine.
            </span>
          </p>
        </div>
        <div>
          <div className="font-semibold text-(--foreground)">
            Option 2: Custom credit
          </div>
          <p>
            Enter the exact credit text you want shown under the image. A link
            is optional but recommended when the image is from the web.
          </p>
          <div className="mt-2 rounded bg-(--muted) p-3">
            <div className="text-(--foreground)">Example credit text:</div>
            <div>Image from NASA</div>
            <div className="mt-1 text-(--foreground)">Example link:</div>
            <div>https://www.nasa.gov/example</div>
          </div>
        </div>
      </div>
    </details>
  );
}
