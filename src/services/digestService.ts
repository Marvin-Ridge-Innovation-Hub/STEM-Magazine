import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// Create transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Max execution time before we should stop (8 seconds, leaving 2s buffer for 10s limit)
const MAX_EXECUTION_TIME = 8000;

interface DigestActivity {
  postId: string;
  postTitle: string;
  postType: string;
  newLikes: number;
  newComments: Array<{
    authorName: string;
    content: string;
    createdAt: Date;
  }>;
}

interface ReplyActivity {
  postId: string;
  parentCommentContent: string;
  postTitle: string;
  replyAuthorName: string;
  replyContent: string;
  createdAt: Date;
}

interface DigestData {
  hasActivity: boolean;
  posts: DigestActivity[];
  replies: ReplyActivity[];
  totalLikes: number;
  totalComments: number;
  totalReplies: number;
}

/**
 * Generate digest data for a user
 */
async function generateDigest(
  userId: string,
  lastDigestSentAt: Date | null
): Promise<DigestData> {
  const sinceDate =
    lastDigestSentAt || new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get user's posts (submissions)
  const userPosts = await prisma.submission.findMany({
    where: {
      authorId: userId,
      status: 'APPROVED',
    },
    select: {
      id: true,
      title: true,
      postType: true,
    },
  });

  const postIds = userPosts.map((p) => p.id);
  const postMap = new Map(userPosts.map((p) => [p.id, p]));

  // Get new likes since last digest
  const newLikes = await prisma.submissionLike.findMany({
    where: {
      submissionId: { in: postIds },
      createdAt: { gt: sinceDate },
    },
    select: {
      submissionId: true,
    },
  });

  // Group likes by post
  const likesByPost = new Map<string, number>();
  for (const like of newLikes) {
    const count = likesByPost.get(like.submissionId) || 0;
    likesByPost.set(like.submissionId, count + 1);
  }

  // Get new comments since last digest
  const newComments = await prisma.submissionComment.findMany({
    where: {
      submissionId: { in: postIds },
      parentId: null, // Only top-level comments
      createdAt: { gt: sinceDate },
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group comments by post
  const commentsByPost = new Map<
    string,
    Array<{ authorName: string; content: string; createdAt: Date }>
  >();
  for (const comment of newComments) {
    const existing = commentsByPost.get(comment.submissionId) || [];
    existing.push({
      authorName: comment.author.name || 'Anonymous',
      content: comment.content,
      createdAt: comment.createdAt,
    });
    commentsByPost.set(comment.submissionId, existing);
  }

  // Get replies to user's comments
  const userComments = await prisma.submissionComment.findMany({
    where: {
      authorId: userId,
    },
    select: {
      id: true,
      content: true,
      submissionId: true,
      submission: {
        select: {
          title: true,
        },
      },
    },
  });

  const userCommentIds = userComments.map((c) => c.id);
  const commentMap = new Map(userComments.map((c) => [c.id, c]));

  const newReplies = await prisma.submissionComment.findMany({
    where: {
      parentId: { in: userCommentIds },
      createdAt: { gt: sinceDate },
      authorId: { not: userId }, // Exclude self-replies
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Build reply activity
  const replies: ReplyActivity[] = newReplies.map((reply) => {
    const parentComment = commentMap.get(reply.parentId!);
    return {
      postId: parentComment?.submissionId || '',
      parentCommentContent:
        parentComment?.content.substring(0, 50) + '...' || 'Your comment',
      postTitle: parentComment?.submission.title || 'Unknown post',
      replyAuthorName: reply.author.name || 'Anonymous',
      replyContent: reply.content,
      createdAt: reply.createdAt,
    };
  });

  // Build posts with activity
  const posts: DigestActivity[] = [];
  for (const [postId, post] of postMap) {
    const likes = likesByPost.get(postId) || 0;
    const comments = commentsByPost.get(postId) || [];

    if (likes > 0 || comments.length > 0) {
      posts.push({
        postId,
        postTitle: post.title,
        postType: post.postType,
        newLikes: likes,
        newComments: comments,
      });
    }
  }

  const totalLikes = Array.from(likesByPost.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalComments = newComments.length;
  const totalReplies = replies.length;

  return {
    hasActivity: posts.length > 0 || replies.length > 0,
    posts,
    replies,
    totalLikes,
    totalComments,
    totalReplies,
  };
}

/**
 * Send digest email to a user
 */
async function sendDigestEmail(
  userName: string,
  userEmail: string,
  digest: DigestData
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mrhsstemmag.com';
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Build posts HTML
  let postsHtml = '';
  for (const post of digest.posts) {
    const postTypeLabel =
      post.postType === 'SM_EXPO'
        ? 'SM Expo'
        : post.postType === 'SM_NOW'
          ? 'SM Now'
          : 'SM Pods';
    const postUrl = `${baseUrl}/posts/${post.postId}`;

    let activityHtml = '';
    if (post.newLikes > 0) {
      activityHtml += `<li style="color: #6b7280; margin-bottom: 4px;">${post.newLikes} new like${post.newLikes > 1 ? 's' : ''}</li>`;
    }
    if (post.newComments.length > 0) {
      activityHtml += `<li style="color: #6b7280; margin-bottom: 8px;">${post.newComments.length} new comment${post.newComments.length > 1 ? 's' : ''}:</li>`;
      for (const comment of post.newComments.slice(0, 3)) {
        activityHtml += `
          <li style="color: #374151; margin-left: 16px; margin-bottom: 4px; list-style: none;">
            <em>"${comment.content.substring(0, 80)}${comment.content.length > 80 ? '...' : ''}"</em>
            <span style="color: #9ca3af;"> - ${comment.authorName}</span>
          </li>
        `;
      }
      if (post.newComments.length > 3) {
        activityHtml += `<li style="color: #9ca3af; margin-left: 16px; list-style: none;">...and ${post.newComments.length - 3} more</li>`;
      }
    }

    postsHtml += `
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #f97316;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="display: inline-block; background-color: #1e3a5f; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;">${postTypeLabel}</span>
        </div>
        <a href="${postUrl}" style="text-decoration: none;">
          <h3 style="margin: 0 0 12px; color: #1e3a5f; font-size: 16px; font-weight: 600;">
            ${post.postTitle}
          </h3>
        </a>
        <ul style="margin: 0 0 12px; padding-left: 20px;">
          ${activityHtml}
        </ul>
        <a href="${postUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; text-decoration: none;">
          View Post
        </a>
      </div>
    `;
  }

  // Build replies HTML
  let repliesHtml = '';
  if (digest.replies.length > 0) {
    repliesHtml = `
      <div style="margin-top: 24px;">
        <h3 style="color: #1e3a5f; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
          Replies to Your Comments
        </h3>
    `;

    for (const reply of digest.replies.slice(0, 5)) {
      const replyPostUrl = `${baseUrl}/posts/${reply.postId}`;
      repliesHtml += `
        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            On <a href="${replyPostUrl}" style="color: #1e3a5f; text-decoration: none; font-weight: 500;">"${reply.postTitle}"</a>
          </div>
          <div style="color: #374151;">
            <strong>${reply.replyAuthorName}</strong> replied:
            <em>"${reply.replyContent.substring(0, 100)}${reply.replyContent.length > 100 ? '...' : ''}"</em>
          </div>
          <a href="${replyPostUrl}" style="display: inline-block; color: #f97316; font-size: 13px; font-weight: 500; text-decoration: none; margin-top: 8px;">
            View Reply &rarr;
          </a>
        </div>
      `;
    }

    if (digest.replies.length > 5) {
      repliesHtml += `<p style="color: #6b7280; font-size: 14px;">...and ${digest.replies.length - 5} more replies</p>`;
    }

    repliesHtml += '</div>';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your STEM Magazine Activity</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                    Your Activity Digest
                  </h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                    ${today}
                  </p>
                </td>
              </tr>
              
              <!-- Summary -->
              <tr>
                <td style="padding: 24px 40px; background-color: #fff7ed; border-bottom: 1px solid #fed7aa;">
                  <p style="margin: 0; color: #1e3a5f; font-size: 16px; text-align: center;">
                    <strong style="color: #f97316;">${digest.totalLikes}</strong> like${digest.totalLikes !== 1 ? 's' : ''} &bull;
                    <strong style="color: #f97316;">${digest.totalComments}</strong> comment${digest.totalComments !== 1 ? 's' : ''} &bull;
                    <strong style="color: #f97316;">${digest.totalReplies}</strong> repl${digest.totalReplies !== 1 ? 'ies' : 'y'}
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${userName},
                  </p>
                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Here's what happened on your posts since your last digest:
                  </p>
                  
                  <!-- Posts with activity -->
                  ${postsHtml}
                  
                  <!-- Replies -->
                  ${repliesHtml}
                  
                  <!-- CTA Button -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Dashboard
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
                    You're receiving this because you have activity digest enabled.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Manage your preferences in your <a href="${baseUrl}/dashboard?tab=email-preferences" style="color: #f97316;">dashboard</a>.
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
      to: userEmail,
      subject: `Your STEM Magazine Activity - ${today}`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send digest to ${userEmail}:`, error);
    return false;
  }
}

/**
 * Process all pending digests with timeout awareness
 * Returns the number of users processed and remaining
 */
export async function processDigests(): Promise<{
  processed: number;
  remaining: number;
  errors: number;
}> {
  const startTime = Date.now();

  // Query only users with pending digests who have enabled digest and master email
  const subscriptions = await prisma.newsletterSubscription.findMany({
    where: {
      hasPendingDigest: true,
      digestEnabled: true,
      emailEnabled: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    take: 50, // Limit batch size to be safe
  });

  let processed = 0;
  let errors = 0;

  for (const subscription of subscriptions) {
    // Check if we're approaching timeout (8 seconds)
    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
      console.log(
        `Timeout approaching after ${Date.now() - startTime}ms, processed ${processed} users`
      );
      break;
    }

    try {
      const digest = await generateDigest(
        subscription.userId,
        subscription.lastDigestSentAt
      );

      if (digest.hasActivity) {
        const sent = await sendDigestEmail(
          subscription.user.name || 'User',
          subscription.user.email,
          digest
        );

        if (!sent) {
          errors++;
        }
      }

      // Clear flag and update timestamp regardless of whether we sent an email
      // (if no activity, we still don't want to reprocess this user tomorrow)
      await prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: {
          hasPendingDigest: false,
          lastDigestSentAt: new Date(),
        },
      });

      processed++;
    } catch (error) {
      console.error(
        `Error processing digest for user ${subscription.userId}:`,
        error
      );
      errors++;
    }
  }

  const remaining = subscriptions.length - processed;

  console.log(
    `Digest processing complete: ${processed} processed, ${remaining} remaining, ${errors} errors in ${Date.now() - startTime}ms`
  );

  return { processed, remaining, errors };
}
