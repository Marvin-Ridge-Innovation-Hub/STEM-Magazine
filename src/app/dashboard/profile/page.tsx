'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Loader2,
  Save,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ProfileData {
  bio: string;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
  instagram: string;
  youtube: string;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    bio: '',
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
    instagram: '',
    youtube: '',
  });

  useEffect(() => {
    if (isLoaded) {
      loadProfile();
    }
  }, [isLoaded]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success && data.profile) {
        setProfileId(data.profile.id || null);
        setProfile({
          bio: data.profile.bio || '',
          website: data.profile.website || '',
          twitter: data.profile.twitter || '',
          github: data.profile.github || '',
          linkedin: data.profile.linkedin || '',
          instagram: data.profile.instagram || '',
          youtube: data.profile.youtube || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const socialFields = [
    {
      key: 'website',
      label: 'Website',
      icon: Globe,
      placeholder: 'https://yourwebsite.com',
      color: 'text-gray-600 dark:text-gray-400',
    },
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: Twitter,
      placeholder: 'https://twitter.com/username',
      color: 'text-sky-500',
    },
    {
      key: 'github',
      label: 'GitHub',
      icon: Github,
      placeholder: 'https://github.com/username',
      color: 'text-gray-900 dark:text-gray-100',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/in/username',
      color: 'text-blue-600',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      placeholder: 'https://instagram.com/username',
      color: 'text-pink-500',
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      placeholder: 'https://youtube.com/@channel',
      color: 'text-red-500',
    },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      <div className="border-b border-(--border) bg-(--card)">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Link
              href={profileId ? `/author/${profileId}` : '#'}
              aria-disabled={!profileId}
              className={`inline-flex items-center gap-2 text-sm text-(--primary) hover:underline ${
                profileId ? '' : 'pointer-events-none opacity-60'
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              View Public Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-(--muted)">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || 'Profile'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-8 w-8 text-(--muted-foreground)" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
                Public Profile
              </h1>
              <p className="text-(--muted-foreground)">
                Customize how others see you on STEM Magazine
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="bg-(--card) rounded-xl border border-(--border) p-6">
              <h2 className="text-lg font-semibold text-(--foreground) mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-(--primary)" />
                About You
              </h2>
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-(--foreground) mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Tell others about yourself, your interests, and what you're working on..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border border-(--input) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50 resize-none transition-all"
                />
                <p className="text-xs text-(--muted-foreground) mt-2 text-right">
                  {profile.bio.length}/500 characters
                </p>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-(--card) rounded-xl border border-(--border) p-6">
              <h2 className="text-lg font-semibold text-(--foreground) mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-(--primary)" />
                Social Links
              </h2>
              <p className="text-sm text-(--muted-foreground) mb-6">
                Add links to your social profiles so others can connect with you
              </p>

              <div className="space-y-4">
                {socialFields.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="flex items-center gap-2 text-sm font-medium text-(--foreground) mb-2"
                    >
                      <field.icon className={`h-4 w-4 ${field.color}`} />
                      {field.label}
                    </label>
                    <input
                      type="url"
                      id={field.key}
                      value={profile[field.key as keyof ProfileData]}
                      onChange={(e) =>
                        setProfile({ ...profile, [field.key]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg border border-(--input) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-(--primary) text-(--primary-foreground) font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
