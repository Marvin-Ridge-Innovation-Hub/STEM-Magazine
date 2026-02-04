import nodemailer from 'nodemailer';
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #10B981; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 10px 10px 10px 0;
              font-weight: bold;
            }
            .button.secondary {
              background-color: #6B7280;
            }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #4B5563; }
            .value { color: #111827; }
            .footer { text-align: center; color: #6B7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Submission Pending Review</h1>
            </div>
            <div class="content">
              <p>A new ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} post has been submitted and is awaiting your review.</p>
              
              <div class="submission-info">
                <div class="field">
                  <div class="label">Title:</div>
                  <div class="value">${submission.title}</div>
                </div>
                
                <div class="field">
                  <div class="label">Author:</div>
                  <div class="value">${authorName} (${authorEmail})</div>
                </div>
                
                <div class="field">
                  <div class="label">Post Type:</div>
                  <div class="value">${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'}</div>
                </div>
                
                <div class="field">
                  <div class="label">Submitted:</div>
                  <div class="value">${new Date(submission.submittedAt).toLocaleString()}</div>
                </div>
                
                <div class="field">
                  <div class="label">Content Preview:</div>
                  <div class="value">${submission.content.substring(0, 200)}${submission.content.length > 200 ? '...' : ''}</div>
                </div>
              </div>
              
              <div style="margin: 30px 0;">
                <a href="${approvalUrl}" class="button">✓ Approve & Publish</a>
                <a href="${viewUrl}" class="button secondary">View Full Submission</a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px;">
                <strong>One-Click Approval:</strong> Click the "Approve & Publish" button to instantly approve and publish this post.
                The author will be notified automatically.
              </p>
              
              <div class="footer">
                <p>This is an automated notification from STEM Magazine Submission System</p>
                <p>To reject this submission or provide feedback, please visit the admin dashboard</p>
              </div>
            </div>
          </div>
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
 * Send approval notification to author
 */
export async function sendApprovalNotification(
  submission: Submission,
  authorName: string,
  authorEmail: string
): Promise<void> {
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${submission.id}`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: authorEmail,
    subject: `✓ Your ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} Post has been Approved!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-box { background-color: #D1FAE5; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { text-align: center; color: #6B7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Congratulations!</h1>
            </div>
            <div class="content">
              <p>Hi ${authorName},</p>
              
              <div class="success-box">
                <h2 style="margin-top: 0; color: #065F46;">Your post has been approved and published!</h2>
                <p style="margin-bottom: 0;"><strong>Title:</strong> ${submission.title}</p>
              </div>
              
              <p>Your ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} submission has been reviewed and approved by our moderation team. It's now live and visible to all readers!</p>
              
              <div style="text-align: center;">
                <a href="${postUrl}" class="button">View Your Published Post</a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Thank you for your contribution to STEM Magazine. We appreciate your effort in creating quality content for our community.
              </p>
              
              <div class="footer">
                <p>STEM Magazine Submission System</p>
                <p>Keep creating amazing content!</p>
              </div>
            </div>
          </div>
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
 * Send rejection notification to author
 */
export async function sendRejectionNotification(
  submission: Submission,
  authorName: string,
  authorEmail: string,
  rejectionReason: string
): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: authorEmail,
    subject: `Update on Your ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} Submission`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #EF4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .rejection-box { background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .feedback-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { text-align: center; color: #6B7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Submission Review Update</h1>
            </div>
            <div class="content">
              <p>Hi ${authorName},</p>
              
              <div class="rejection-box">
                <h2 style="margin-top: 0; color: #991B1B;">Your submission requires revision</h2>
                <p style="margin-bottom: 0;"><strong>Title:</strong> ${submission.title}</p>
              </div>
              
              <p>Thank you for your ${submission.postType === 'SM_EXPO' ? 'SM Expo' : 'SM Now'} submission. After careful review, we've determined that your post needs some revisions before it can be published.</p>
              
              <div class="feedback-box">
                <h3 style="margin-top: 0; color: #4B5563;">Moderator Feedback:</h3>
                <p style="color: #111827;">${rejectionReason}</p>
              </div>
              
              <p>We encourage you to review the feedback and submit an updated version. Our moderation team is here to help you create the best content possible.</p>
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                If you have any questions about this feedback or need clarification, please don't hesitate to reach out to our team.
              </p>
              
              <div class="footer">
                <p>STEM Magazine Submission System</p>
                <p>We're looking forward to seeing your improved submission!</p>
              </div>
            </div>
          </div>
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
