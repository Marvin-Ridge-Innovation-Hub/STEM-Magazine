import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for MRHS STEM Magazine.',
  alternates: {
    canonical: '/privacy',
  },
};

const LAST_UPDATED = 'February 9, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-(--background)">
      <section className="border-b border-[color:var(--border)] bg-[var(--card)]/60">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            Legal
          </p>
          <h1 className="mt-3 font-display text-3xl text-[var(--foreground)] sm:text-4xl">
            STEM Magazine Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Last Updated: {LAST_UPDATED}
          </p>
          <p className="mt-6 text-sm leading-7 text-[var(--muted-foreground)]">
            This Privacy Policy explains what information STEM Magazine
            collects, how we use it, and the choices you have. By using{' '}
            <a
              href="https://mrhsstemmag.com"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              https://mrhsstemmag.com
            </a>
            , you consent to this policy.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            1. Information We Collect
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We may collect account information (name, email, profile image),
            user-submitted content (posts, comments, media), and basic usage
            information needed to operate and secure the Platform.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            2. How We Use Information
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We use collected information to provide the service, moderate
            content, maintain account security, communicate with users, and
            improve platform reliability and performance.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            3. User Content Visibility
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            Content you submit for publication may become publicly visible on
            the Platform once approved. Please do not submit private or
            sensitive personal information in public content.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            4. Sharing of Information
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We do not sell personal information. We may share data with service
            providers that help operate the Platform (such as authentication,
            hosting, and analytics) and when required by law.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            5. Cookies and Similar Technologies
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We and our providers may use cookies or similar technologies for
            authentication, session management, security, and site performance.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            6. Data Retention
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We retain data for as long as reasonably necessary to provide the
            Platform, comply with legal obligations, and resolve disputes.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            7. Data Security
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We use reasonable administrative and technical safeguards, but no
            method of transmission or storage is completely secure.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            8. Children&apos;s Privacy
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            The Platform is intended for users age 13 and older. If you believe
            a child has provided personal information inappropriately, contact
            us so we can review and take action.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            9. Your Choices
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            You can request profile updates or account-related support through
            our contact channels. Depending on your location, you may have
            additional privacy rights under applicable law.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            10. Changes to This Policy
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            We may update this Privacy Policy periodically. Continued use of the
            Platform after updates indicates acceptance of the revised policy.
          </p>
        </article>

        <article className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-display text-xl text-[var(--foreground)]">
            11. Contact
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            For privacy questions, contact{' '}
            <a
              href="mailto:mrhs.stemmag@gmail.com"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              mrhs.stemmag@gmail.com
            </a>{' '}
            or visit our{' '}
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
