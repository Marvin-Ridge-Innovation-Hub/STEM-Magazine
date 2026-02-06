import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import type { Submission } from '@/types';

// Create transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send submission notification to moderators with one-click approval link
 */
export async function sendSubmissionForReview(
  submission: Submission,
  authorName: string,
  authorEmail: string
): Promise<void> {
  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/approve?token=${submission.approvalToken}`;
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: process.env.MODERATOR_EMAIL, // Comma-separated list of moderators
    subject: `New ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} Submission: ${submission.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                        New Submission Pending Review
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                        A new <strong>${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'}</strong> post has been submitted and is awaiting your review.
                      </p>
                      
                      <!-- Submission Card -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #f97316;">
                        <div style="margin-bottom: 16px;">
                          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Title</div>
                          <div style="font-size: 18px; font-weight: 600; color: #111827;">${submission.title}</div>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Author</div>
                          <div style="color: #374151;">${authorName} (${authorEmail})</div>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Post Type</div>
                          <span style="display: inline-block; background-color: #1e3a5f; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                            ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'}
                          </span>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Submitted</div>
                          <div style="color: #374151;">${new Date(submission.submittedAt).toLocaleString()}</div>
                        </div>
                        
                        <div>
                          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Content Preview</div>
                          <div style="color: #4b5563; font-size: 14px; line-height: 1.5;">${submission.content.substring(0, 200)}${submission.content.length > 200 ? '...' : ''}</div>
                        </div>
                      </div>
                      
                      <!-- Action Buttons -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                        <tr>
                          <td style="padding-right: 8px;">
                            <a href="${approvalUrl}" style="display: block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center;">
                              Approve & Publish
                            </a>
                          </td>
                          <td style="padding-left: 8px;">
                            <a href="${viewUrl}" style="display: block; background-color: #1e3a5f; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center;">
                              View Full Submission
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0; color: #6b7280; font-size: 13px; background-color: #fef3c7; padding: 12px 16px; border-radius: 8px;">
                        <strong>One-Click Approval:</strong> Click "Approve & Publish" to instantly approve and publish this post. The author will be notified automatically.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                        STEM Magazine Submission System
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        To reject this submission or provide feedback, please visit the admin dashboard.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Submission notification sent for: ${submission.title}`);
  } catch (error) {
    console.error('Error sending submission notification:', error);
    throw new Error('Failed to send submission notification');
  }
}

/**
 * Check if user has email notifications enabled
 * Returns preference object with emailEnabled, emailOnApproval, emailOnRejection
 */
async function getUserEmailPreferences(authorId: string): Promise<{
  emailEnabled: boolean;
  emailOnApproval: boolean;
  emailOnRejection: boolean;
} | null> {
  try {
    const subscription = await prisma.newsletterSubscription.findFirst({
      where: { userId: authorId },
      select: {
        emailEnabled: true,
        emailOnApproval: true,
        emailOnRejection: true,
      },
    });

    if (!subscription) {
      // If no subscription exists, default to allowing emails
      return {
        emailEnabled: true,
        emailOnApproval: true,
        emailOnRejection: true,
      };
    }

    return subscription;
  } catch (error) {
    console.error('Error fetching user email preferences:', error);
    // On error, default to allowing emails to not block notifications
    return {
      emailEnabled: true,
      emailOnApproval: true,
      emailOnRejection: true,
    };
  }
}

/**
 * Send approval notification to author (checks user preferences first)
 */
export async function sendApprovalNotification(
  submission: Submission,
  authorName: string,
  authorEmail: string,
  authorId?: string // Database ID to check preferences
): Promise<void> {
  // Check user preferences if authorId is provided
  if (authorId) {
    const prefs = await getUserEmailPreferences(authorId);
    if (prefs && (!prefs.emailEnabled || !prefs.emailOnApproval)) {
      console.log(
        `Skipping approval email for ${authorEmail} - user has disabled this notification`
      );
      return;
    }
  }
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${submission.id}`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: authorEmail,
    subject: `✓ Your ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} Post has been Approved!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        Congratulations!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Hi ${authorName},
                      </p>
                      
                      <!-- Success Box -->
                      <div style="background-color: #D1FAE5; border-left: 4px solid #10B981; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                        <h2 style="margin: 0 0 8px; color: #065F46; font-size: 18px; font-weight: 600;">
                          Your post has been approved and published!
                        </h2>
                        <p style="margin: 0; color: #047857;">
                          <strong>Title:</strong> ${submission.title}
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Your <strong>${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'}</strong> submission has been reviewed and approved by our moderation team. It's now live and visible to all readers!
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${postUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View Your Published Post
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Thank you for your contribution to STEM Magazine. We appreciate your effort in creating quality content for our community.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                        STEM Magazine Submission System
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Keep creating amazing content!
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval notification sent to: ${authorEmail}`);
  } catch (error) {
    console.error('Error sending approval notification:', error);
    throw new Error('Failed to send approval notification');
  }
}

/**
 * Send rejection notification to author (checks user preferences first)
 */
export async function sendRejectionNotification(
  submission: Submission,
  authorName: string,
  authorEmail: string,
  rejectionReason: string,
  authorId?: string // Database ID to check preferences
): Promise<void> {
  // Check user preferences if authorId is provided
  if (authorId) {
    const prefs = await getUserEmailPreferences(authorId);
    if (prefs && (!prefs.emailEnabled || !prefs.emailOnRejection)) {
      console.log(
        `Skipping rejection email for ${authorEmail} - user has disabled this notification`
      );
      return;
    }
  }
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: authorEmail,
    subject: `Update on Your ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} Submission`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 32px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        Submission Review Update
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Hi ${authorName},
                      </p>
                      
                      <!-- Rejection Box -->
                      <div style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                        <h2 style="margin: 0 0 8px; color: #991B1B; font-size: 18px; font-weight: 600;">
                          Your submission requires revision
                        </h2>
                        <p style="margin: 0; color: #B91C1C;">
                          <strong>Title:</strong> ${submission.title}
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Thank you for your <strong>${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'}</strong> submission. After careful review, we've determined that your post needs some revisions before it can be published.
                      </p>
                      
                      <!-- Feedback Box -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                        <h3 style="margin: 0 0 12px; color: #1e3a5f; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                          Moderator Feedback
                        </h3>
                        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                          ${rejectionReason}
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        We encourage you to review the feedback and submit an updated version. Our moderation team is here to help you create the best content possible.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions about this feedback or need clarification, please don't hesitate to reach out to our team.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                        STEM Magazine Submission System
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        We're looking forward to seeing your improved submission!
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection notification sent to: ${authorEmail}`);
  } catch (error) {
    console.error('Error sending rejection notification:', error);
    throw new Error('Failed to send rejection notification');
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
