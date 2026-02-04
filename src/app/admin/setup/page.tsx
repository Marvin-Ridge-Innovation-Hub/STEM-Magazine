'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function AdminSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MODERATOR' | 'ADMIN'>('MODERATOR');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${email} is now a ${role}!` });
        setEmail('');

        // If setting your own role, redirect after 2 seconds
        if (data.shouldRefresh) {
          setTimeout(() => {
            router.push('/admin');
          }, 2000);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to set role' });
      }
    } catch (error) {
      console.error('Error setting role:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full bg-(--card) border border-(--border) rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <div className="mb-2 flex justify-center">
            <Settings className="h-10 w-10 text-(--primary)" />
          </div>
          <h1 className="text-2xl font-bold font-poppins text-(--foreground)">
            Admin Setup
          </h1>
          <p className="text-sm text-(--muted-foreground) mt-2">
            Set moderator or admin roles for users
          </p>
        </div>

        {message && (
          <motion.div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleSetRole} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-(--foreground) mb-2">
              User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--foreground) mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'MODERATOR' | 'ADMIN')}
              className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-lg text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            >
              <option value="MODERATOR">
                Moderator (Can approve/reject submissions)
              </option>
              <option value="ADMIN">Admin (Full access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-full font-semibold shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? 'Setting role...' : 'Set Role'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div className="text-xs text-yellow-500">
              <strong>Security Note:</strong> This page should be protected or
              removed in production. Currently, any authenticated user can
              access it to set roles.
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
