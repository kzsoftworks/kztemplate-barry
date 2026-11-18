import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy · KZ Barry' };

// Placeholder. Replace with your product's privacy policy before launch.
export default function PrivacyPage() {
  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground max-w-prose">
        This is a placeholder. Replace it with the privacy policy that applies
        to your product before you launch.
      </p>
    </article>
  );
}
