import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for MRHS STEM Magazine.',
  alternates: {
    canonical: '/tos',
  },
};

const LAST_UPDATED = 'February 9, 2026';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-(--background)">
      <section className="border-b border-[color:var(--border)] bg-[var(--card)]/60">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            Legal
          </p>
          <h1 className="mt-3 font-display text-3xl text-[var(--foreground)] sm:text-4xl">
            STEM Magazine Terms of Service
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Last Updated: {LAST_UPDATED}
          </p>
          <p className="mt-6 text-sm leading-7 text-[var(--muted-foreground)]">
            Welcome to STEM Magazine ({' '}
            <span className="font-medium text-[var(--foreground)]">we</span>,{' '}
            <span className="font-medium text-[var(--foreground)]">our</span>,
            or <span className="font-medium text-[var(--foreground)]">us</span>
            ). By accessing or using{' '}
            <a
              href="https://mrhsstemmag.com"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              https://mrhsstemmag.com
            </a>{' '}
            (the Platform), you agree to be bound by these Terms of Service
            (Terms). If you do not agree, do not use the Platform.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            1. Eligibility
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
            <li>You are at least 13 years old.</li>
            <li>
              If you are under 18, you have parental or guardian permission to
              use the Platform.
            </li>
            <li>
              You will comply with all applicable local, state, and federal
              laws.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We reserve the right to suspend or terminate accounts that violate
            these conditions.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            2. Account Registration
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            Certain features require account creation. When creating an account,
            you agree to provide accurate information, keep your login
            credentials confidential, and remain responsible for all activity
            under your account.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We reserve the right to suspend or terminate accounts for violations
            of these Terms.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            3. User Content
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            Users may submit posts, articles, comments, media, and other
            materials (User Content). By submitting content, you affirm that
            your content is original or properly licensed for publication.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            You grant STEM Magazine a non-exclusive, worldwide, royalty-free
            license to display, distribute, and promote your content on the
            Platform. You retain ownership of your content.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            4. Content Guidelines
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            You agree not to post content that is unlawful, harmful, harassing,
            infringing, deceptive, spammy, or promotes illegal activity. All
            submissions are subject to moderator review and approval before
            publication.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We may remove content at any time without prior notice.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            5. Intellectual Property
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            All original site content, branding, logos, design elements, and
            software on STEM Magazine (excluding User Content) are owned by STEM
            Magazine or its licensors.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            You may not reproduce or redistribute site content without
            permission or use our branding in a misleading way.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            6. Copyright Policy (DMCA)
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            If you believe content on the Platform infringes your copyright,
            contact us at{' '}
            <a
              href="mailto:mrhs.stemmag@gmail.com"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              mrhs.stemmag@gmail.com
            </a>
            . Include your contact information, a description of the work, the
            URL of allegedly infringing content, and a statement that you
            believe the use is unauthorized.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            7. Moderation and Content Approval
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            STEM Magazine uses a moderated publishing model. Submissions may be
            edited for clarity or formatting, rejected for policy violations, or
            removed later if they violate policy.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            8. Termination
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We may suspend or terminate access if users violate these Terms,
            engage in harmful behavior, or attempt to disrupt the Platform.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            9. Disclaimer of Warranties
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            The Platform is provided as is and as available. We do not guarantee
            uninterrupted service, complete accuracy of content, or an
            error-free platform.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            10. Limitation of Liability
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            To the fullest extent permitted by law, STEM Magazine is not liable
            for indirect or consequential damages, data loss, user disputes, or
            actions taken based on published content.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            Users are solely responsible for ensuring they have all rights,
            licenses, permissions, and legal authority for submitted User
            Content. Any copyright or intellectual property claims related to
            User Content are the responsibility of the submitting user.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            11. Changes to These Terms
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We may update these Terms at any time. Continued use of the Platform
            after changes means you accept the revised Terms.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            12. Governing Law
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            These Terms are governed by the laws of the State of North Carolina,
            without regard to conflict of law principles.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            13. Contact
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            For questions regarding these Terms, contact{' '}
            <a
              href="mailto:mrhs.stemmag@gmail.com"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              mrhs.stemmag@gmail.com
            </a>{' '}
            or use the{' '}
            <Link
              href="/contact"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              contact page
            </Link>
            .
          </p>
        </article>
      </section>
    </div>
  );
}
