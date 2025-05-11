// src/lib/email.ts
import { Question } from '@/types';

// Use SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

type EmailTemplate = 'question-received' | 'answer-notification' | 'admin-notification';

interface EmailData {
  question: string;
  answer?: string;
  email?: string;
}

export async function sendEmail({
  to,
  template,
  data,
}: {
  to: string;
  template: EmailTemplate;
  data: EmailData;
}): Promise<boolean> {
  try {
    const from = process.env.FROM_EMAIL || 'chris@azeasycpa.com';
    let subject = '';
    let text = '';
    let html = '';

    switch (template) {
      case 'question-received':
        subject = 'Your Question Has Been Received - Ask the CPA Guy';
        text = `Thank you for submitting your question to Ask the CPA Guy. Your question: "${data.question}" has been received and will be reviewed by our CPA. We'll notify you when your answer is ready.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #cd9f27;">Your Question Has Been Received</h2>
            <p>Thank you for submitting your question to Ask the CPA Guy.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #cd9f27; margin: 20px 0;">
              <p style="margin: 0;"><strong>Your question:</strong> ${data.question}</p>
            </div>
            <p>Your question has been received and will be reviewed by our CPA. We'll notify you when your answer is ready.</p>
            <p>If you have any other questions in the meantime, feel free to submit them on our website.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              &copy; ${new Date().getFullYear()} AZ Easy CPA. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'answer-notification':
        subject = 'Your Question Has Been Answered - Ask the CPA Guy';
        text = `The CPA has answered your question: "${data.question}"\n\nAnswer: ${data.answer}\n\nThank you for using Ask the CPA Guy.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #cd9f27;">Your Question Has Been Answered</h2>
            <p>The CPA has answered your question:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #cd9f27; margin: 20px 0;">
              <p style="margin: 0;"><strong>Your question:</strong> ${data.question}</p>
            </div>
            <div style="background-color: #f9f5e7; padding: 15px; border-left: 4px solid #cd9f27; margin: 20px 0;">
              <p style="margin: 0;"><strong>Answer:</strong> ${data.answer}</p>
            </div>
            <p>Thank you for using Ask the CPA Guy. If you have additional questions, feel free to submit them on our website.</p>
            <p>
              <a href="https://askthecpaguy.com/status" style="color: #cd9f27;">Check your question status</a>
            </p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              &copy; ${new Date().getFullYear()} AZ Easy CPA. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'admin-notification':
        subject = 'New Question Submitted - CPA Dashboard';
        text = `A new question has been submitted: "${data.question}"\n\nFrom: ${data.email}\n\nPlease log in to the dashboard to review.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #cd9f27;">New Question Submitted</h2>
            <p>A new question has been submitted to Ask the CPA Guy:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #cd9f27; margin: 20px 0;">
              <p style="margin: 0;"><strong>Question:</strong> ${data.question}</p>
              <p style="margin: 10px 0 0;"><strong>From:</strong> ${data.email}</p>
              <p style="margin: 10px 0 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>
              <a href="https://askthecpaguy.com/dashboard" style="display: inline-block; background-color: #cd9f27; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Go to Dashboard</a>
            </p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              &copy; ${new Date().getFullYear()} AZ Easy CPA. All rights reserved.
            </p>
          </div>
        `;
        break;
    }

    const msg = {
      to,
      from,
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Helper function to send question received notification
export async function sendQuestionReceivedEmail(email: string, question: string) {
  return sendEmail({
    to: email,
    template: 'question-received',
    data: { question },
  });
}

// Helper function to send answer notification
export async function sendAnswerNotificationEmail(question: Question) {
  if (!question.cpa_response) return false;
  
  return sendEmail({
    to: question.user_email,
    template: 'answer-notification',
    data: {
      question: question.question_text,
      answer: question.cpa_response,
    },
  });
}

// Helper function to send admin notification
export async function sendAdminNotificationEmail(email: string, question: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('Admin email not configured');
    return false;
  }
  
  return sendEmail({
    to: adminEmail,
    template: 'admin-notification',
    data: { 
      email,
      question 
    },
  });
}