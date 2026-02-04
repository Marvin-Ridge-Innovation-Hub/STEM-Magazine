import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { PostType } from '@prisma/client';

// Create transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface NotifySubscribersParams {
  postType: PostType;
  title: string;
  excerpt: string;
  postId: string;
  authorName: string;
  authorId: string; // Database ID of author to exclude from notifications
  tags: string[];
  thumbnailUrl?: string;
}

interface SubscriptionWithUser {
  userId: string;
  subscribeExpo: boolean;
  subscribeNow: boolean;
  subscribePods: boolean;
  tags: string[];
  user: {
    email: string;
    name: string | null;
  };
}

export async function notifySubscribers({
  postType,
  title,
  excerpt,
  postId,
  authorName,
  authorId,
  tags,
  thumbnailUrl,
}: NotifySubscribersParams): Promise<{ success: boolean; notified: number }> {
  try {
    // Find all active subscriptions that match this post type
    // Exclude the author from receiving notifications about their own post
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: {
        isActive: true,
        userId: { not: authorId }, // Exclude author from their own post notification
        OR: [
          { subscribeExpo: postType === 'SM_EXPO' ? true : undefined },
          { subscribeNow: postType === 'SM_NOW' ? true : undefined },
          { subscribePods: postType === 'SM_PODS' ? true : undefined },
        ].filter(Boolean),
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Filter subscriptions based on post type and tags
    const matchingSubscriptions = (
      subscriptions as SubscriptionWithUser[]
    ).filter((sub: SubscriptionWithUser) => {
      // Check post type subscription
      const typeMatch =
        (postType === 'SM_EXPO' && sub.subscribeExpo) ||
        (postType === 'SM_NOW' && sub.subscribeNow) ||
        (postType === 'SM_PODS' && sub.subscribePods);

      if (!typeMatch) return false;

      // If user has specific tag preferences, check if post has any matching tags
      if (sub.tags.length > 0 && tags.length > 0) {
        const hasMatchingTag = sub.tags.some((tag: string) =>
          tags.includes(tag)
        );
        return hasMatchingTag;
      }

      // If no tag preferences set, send notification
      return true;
    });

    if (matchingSubscriptions.length === 0) {
      return { success: true, notified: 0 };
    }

    // Get post type display name
    const postTypeName =
      postType === 'SM_EXPO'
        ? 'SM Expo'
        : postType === 'SM_NOW'
          ? 'SM Now'
          : 'SM Pods';
    const postUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/posts/${postId}`;

    // Send emails to all matching subscribers
    const emailPromises = matchingSubscriptions.map(
      async (sub: SubscriptionWithUser) => {
        const userName = sub.user.name || 'Subscriber';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ${postTypeName} Post</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                New ${postTypeName} Post!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                A new post matching your interests has been published on STEM Magazine:
              </p>
              
              <!-- Post Card -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">` : ''}
                <h2 style="margin: 0 0 12px; color: #111827; font-size: 20px; font-weight: 600;">
                  ${title}
                </h2>
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                  By ${authorName}
                </p>
                <p style="margin: 0 0 16px; color: #4b5563; font-size: 15px; line-height: 1.5;">
                  ${excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt}
                </p>
                ${
                  tags.length > 0
                    ? `
                <div style="margin-bottom: 16px;">
                  ${tags
                    .slice(0, 4)
                    .map(
                      (tag) => `
                    <span style="display: inline-block; background-color: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; margin-right: 8px; margin-bottom: 8px; text-transform: capitalize;">
                      ${tag.replace('-', ' ')}
                    </span>
                  `
                    )
                    .join('')}
                </div>
                `
                    : ''
                }
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="${postUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Read Post
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                You're receiving this because you subscribed to ${postTypeName} notifications.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Manage your preferences in your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="color: #8B5CF6;">dashboard</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

        try {
          await transporter.sendMail({
            from: `"STEM Magazine" <${process.env.SMTP_USER}>`,
            to: sub.user.email,
            subject: `New ${postTypeName}: ${title}`,
            html: htmlContent,
          });
          return true;
        } catch (error) {
          console.error(
            `Failed to send newsletter to ${sub.user.email}:`,
            error
          );
          return false;
        }
      }
    );

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(Boolean).length;

    return { success: true, notified: successCount };
  } catch (error) {
    console.error('Error notifying subscribers:', error);
    return { success: false, notified: 0 };
  }
}
