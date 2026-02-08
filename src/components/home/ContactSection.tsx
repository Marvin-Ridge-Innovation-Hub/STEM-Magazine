'use client';

import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ContactSection() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [useAccountEmail, setUseAccountEmail] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthContent = mounted && isLoaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const emailToUse =
        showAuthContent && isSignedIn && useAccountEmail
          ? user?.primaryEmailAddress?.emailAddress
          : formData.email;

      const nameToUse =
        showAuthContent && isSignedIn && useAccountEmail
          ? user?.fullName || user?.firstName || 'User'
          : formData.name;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameToUse,
          email: emailToUse,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full">
      <div id="contact" />
      <div className="page-header">
        <div className="section-container">
          <motion.div
            className="max-w-5xl mx-auto flex flex-col gap-4"
            {...fadeIn}
          >
            <div className="flex items-center justify-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[color:var(--primary)/10] flex items-center justify-center">
                <Mail className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-[var(--foreground)]">
                Get in Touch
              </h2>
            </div>
            <p className="max-w-2xl text-base sm:text-lg text-[var(--muted-foreground)]">
              Share questions, feedback, or collaboration ideas. We’ll route
              your message to the right place.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-container">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">
            <motion.div
              className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-sm"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Contact
              </div>
              <h3 className="mt-3 font-display text-2xl text-[var(--foreground)]">
                Tell us what you need
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[var(--muted-foreground)]">
                Use the form to ask about submissions, partnerships, or anything
                else STEM Magazine-related. We’ll follow up with the right next
                steps.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-[var(--muted-foreground)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-9 w-9 rounded-full bg-[color:var(--primary)/10] flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">
                      Include key details
                    </div>
                    <div>Subject, context, and any helpful links.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-9 w-9 rounded-full bg-[color:var(--accent)/12] flex items-center justify-center">
                    <Send className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">
                      We’ll route it quickly
                    </div>
                    <div>Your message goes to the right editor or lead.</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="panel-accent rounded-2xl p-6 sm:p-7 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {showAuthContent && isSignedIn && (
                <div
                  className="flex items-center p-3 rounded-lg border mb-4"
                  style={{
                    backgroundColor:
                      'color-mix(in oklch, var(--primary) 10%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAccountEmail}
                      onChange={(e) => setUseAccountEmail(e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Use my account email (
                      {user?.primaryEmailAddress?.emailAddress})
                    </span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {(!showAuthContent || !isSignedIn || !useAccountEmail) && (
                  <>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border transition-all text-sm"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--input)',
                          color: 'var(--foreground)',
                        }}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border transition-all text-sm"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--input)',
                          color: 'var(--foreground)',
                        }}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border transition-all text-sm"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--input)',
                      color: 'var(--foreground)',
                    }}
                    placeholder="What's this about?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border transition-all resize-none text-sm"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--input)',
                      color: 'var(--foreground)',
                    }}
                    placeholder="Tell us more..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2"
                      style={{ borderColor: 'var(--primary-foreground)' }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}
