import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms · KZ Barry' };

// Placeholder. Replace with your product's terms before launch.
export default function TermsPage() {
  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="text-muted-foreground max-w-prose">
        This is a placeholder. Replace it with the terms that apply to your
        product before you launch.
      </p>
    </article>
  );
}
