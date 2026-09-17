/**
 * Server-side Candidate Notification Email Service for Nivara
 * Uses official Resend SDK to notify candidate when a citizen needs help.
 * API keys and server configuration remain strictly server-side.
 */

import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

export interface CandidateNotificationRequest {
  name: string;
  age?: string | number;
  location?: string;
  visitorEmail?: string;
  grievance: string;
  conversationSummary?: string;
  nivaraResponse?: string;
  suggestedNextStep?: string;
  date?: string;
  time?: string;
  requestId?: string;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  message: string;
  recipient?: string;
  referenceId?: string;
  deliveredAt?: string;
}

/**
 * Strict email validation
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed);
}

/**
 * Dynamically loads fresh environment variables from .env
 */
export function loadFreshEnv(): Record<string, string> {
  const envVars: Record<string, string> = { ...(process.env as Record<string, string>) };
  const envPath = path.resolve(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          envVars[key] = val;
          process.env[key] = val;
        }
      }
    } catch (err) {
      console.warn('[loadFreshEnv Warning]:', err);
    }
  }
  return envVars;
}

/**
 * Generate professional HTML email for superhero notification
 */
export function generateCandidateNotificationHtml(payload: {
  name: string;
  age: string;
  location: string;
  visitorEmail: string;
  grievance: string;
  date: string;
  time: string;
  conversationSummary: string;
  nivaraResponse?: string;
  suggestedNextStep?: string;
  referenceId: string;
}): string {
  const {
    name,
    age,
    location,
    visitorEmail,
    grievance,
    date,
    time,
    conversationSummary,
    nivaraResponse,
    suggestedNextStep,
    referenceId
  } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🦸 Someone Needs Your Help!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #090e1a; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.95), 0 0 60px rgba(56, 189, 248, 0.1);">
          
          <!-- Banner -->
          <tr>
            <td style="padding: 36px 32px 26px 32px; text-align: center; background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.2) 0%, rgba(9, 14, 26, 1) 85%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: inline-block; width: 44px; height: 44px; border-radius: 50%; background: #030712; border: 1px solid rgba(56, 189, 248, 0.4); text-align: center; line-height: 44px; font-size: 22px; margin-bottom: 12px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.25);">
                🦸
              </div>
              <h1 style="margin: 0; font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 800; letter-spacing: 0.2em; color: #ffffff; text-transform: uppercase;">
                NIVARA HELP REQUEST
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 11px; letter-spacing: 0.18em; color: #38bdf8; text-transform: uppercase; font-weight: 600;">
                Active Superhero Sentinel Alert
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 28px 32px 14px 32px;">
              <p style="margin: 0; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                Someone has reached out to Nivara's sanctuary seeking guidance and support. Below are the recorded details:
              </p>
            </td>
          </tr>

          <!-- Citizen Demographic Card -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px 22px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #cbd5e1; line-height: 2;">
                  <tr>
                    <td width="140" style="color: #94a3b8; font-weight: 600;">Visitor Name:</td>
                    <td style="color: #ffffff; font-weight: bold;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8; font-weight: 600;">Age:</td>
                    <td style="color: #ffffff;">${age}</td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8; font-weight: 600;">Location:</td>
                    <td style="color: #ffffff;">${location}</td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8; font-weight: 600;">Visitor Email:</td>
                    <td><a href="mailto:${visitorEmail}" style="color: #38bdf8; text-decoration: none;">${visitorEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8; font-weight: 600;">Date:</td>
                    <td style="color: #ffffff;">${date}</td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8; font-weight: 600;">Time:</td>
                    <td style="color: #ffffff;">${time}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Grievance Section -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background: rgba(56, 189, 248, 0.04); border-left: 3px solid #38bdf8; border-radius: 0 12px 12px 0; padding: 18px 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.2em; color: #7dd3fc; text-transform: uppercase; font-weight: 700;">
                  GRIEVANCE / REQUEST
                </h3>
                <p style="margin: 0; font-size: 14px; color: #f1f5f9; line-height: 1.6; font-style: italic;">
                  "${grievance}"
                </p>
              </div>
            </td>
          </tr>

          <!-- Conversation Summary Section -->
          ${conversationSummary ? `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background: rgba(255, 255, 255, 0.025); border-left: 3px solid #64748b; border-radius: 0 12px 12px 0; padding: 18px 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.2em; color: #94a3b8; text-transform: uppercase; font-weight: 700;">
                  CONVERSATION SUMMARY
                </h3>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  ${conversationSummary}
                </p>
              </div>
            </td>
          </tr>` : ''}

          <!-- Nivara's Response Section -->
          ${nivaraResponse ? `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background: rgba(56, 189, 248, 0.03); border-left: 3px solid #0284c7; border-radius: 0 12px 12px 0; padding: 18px 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.2em; color: #38bdf8; text-transform: uppercase; font-weight: 700;">
                  NIVARA'S RESPONSE
                </h3>
                <p style="margin: 0; font-size: 13px; color: #e2e8f0; line-height: 1.6; white-space: pre-line;">
                  ${nivaraResponse}
                </p>
              </div>
            </td>
          </tr>` : ''}

          <!-- Suggested Next Step Section -->
          ${suggestedNextStep ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background: rgba(16, 185, 129, 0.05); border-left: 3px solid #10b981; border-radius: 0 12px 12px 0; padding: 18px 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.2em; color: #34d399; text-transform: uppercase; font-weight: 700;">
                  SUGGESTED NEXT STEP
                </h3>
                <p style="margin: 0; font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.6;">
                  ${suggestedNextStep}
                </p>
              </div>
            </td>
          </tr>` : ''}

          <!-- Footer Seam -->
          <tr>
            <td style="padding: 18px 32px; background-color: #050811; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; font-family: monospace;">
                CRYSTAL ARCHIVE REF: ${referenceId}
              </p>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #475569;">
                Automated superhero dispatch from the Nivara Sentinel Portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Record to local audit log for debugging
 */
function recordAuditLog(entry: any) {
  try {
    const logDir = path.resolve(process.cwd(), './.data');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    if (entry.html) {
      fs.writeFileSync(path.join(logDir, 'latest_email.html'), entry.html, 'utf-8');
    }

    const logFile = path.join(logDir, 'dispatched_emails.json');
    let logs: any[] = [];
    if (fs.existsSync(logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      } catch {
        logs = [];
      }
    }
    logs.unshift({
      id: entry.id,
      recipient: entry.recipient,
      subject: entry.subject,
      dispatchedAt: entry.dispatchedAt,
      status: entry.status,
      visitor: {
        name: entry.visitorName,
        email: entry.visitorEmail,
        grievance: entry.grievance
      },
      messageId: entry.messageId || null,
      error: entry.error || null
    });
    fs.writeFileSync(logFile, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Audit Log Warning]:', err);
  }
}

/**
 * Send candidate superhero notification via Resend
 */
export async function notifyCandidateViaResend(
  payload: CandidateNotificationRequest
): Promise<NotificationResponse> {
  const refId = payload.requestId || `CRYO-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const dateStr = payload.date || now.toLocaleDateString();
  const timeStr = payload.time || now.toLocaleTimeString();
  const timestamp = now.toISOString();

  console.log(`[EMAIL] Request received for reference ID: ${refId}`);

  const env = loadFreshEnv();
  const candidateEmail = (
    env.NOTIFICATION_EMAIL ||
    process.env.NOTIFICATION_EMAIL ||
    env.NIVARA_NOTIFICATION_EMAIL ||
    process.env.NIVARA_NOTIFICATION_EMAIL ||
    env.SUPERHERO_NOTIFICATION_EMAIL ||
    process.env.SUPERHERO_NOTIFICATION_EMAIL ||
    env.CANDIDATE_EMAIL ||
    process.env.CANDIDATE_EMAIL ||
    env.VITE_CANDIDATE_EMAIL ||
    process.env.VITE_CANDIDATE_EMAIL ||
    ''
  ).trim();

  if (!candidateEmail || !isValidEmail(candidateEmail)) {
    console.error(`[EMAIL] Candidate notification recipient is invalid or missing: "${candidateEmail}"`);
    return {
      success: false,
      error: 'MISSING_NOTIFICATION_EMAIL',
      message: "Something interrupted the delivery.\nYour conversation is still safe here.",
      referenceId: refId
    };
  }

  console.log(`[EMAIL] Candidate recipient validated: ${candidateEmail}`);

  const visitorName = payload.name ? String(payload.name).trim() : 'Friend';
  const visitorAge = payload.age ? String(payload.age).trim() : 'Not specified';
  const visitorLocation = payload.location ? String(payload.location).trim() : 'Not specified';
  const visitorEmail = payload.visitorEmail ? String(payload.visitorEmail).trim() : 'Not provided';
  const grievance = payload.grievance ? String(payload.grievance).trim() : 'General help requested';
  const conversationSummary = payload.conversationSummary || '';
  const nivaraResponse = payload.nivaraResponse || '';
  const suggestedNextStep = payload.suggestedNextStep || '';

  const subject = '🦸 Someone Needs Your Help!';

  const htmlContent = generateCandidateNotificationHtml({
    name: visitorName,
    age: visitorAge,
    location: visitorLocation,
    visitorEmail,
    grievance,
    date: dateStr,
    time: timeStr,
    conversationSummary,
    nivaraResponse,
    suggestedNextStep,
    referenceId: refId
  });

  const plainText = `🦸 NIVARA HELP REQUEST\n\nSomeone Needs Your Help!\n\nVisitor Name:\n${visitorName}\n\nAge:\n${visitorAge}\n\nLocation:\n${visitorLocation}\n\nVisitor Email:\n${visitorEmail}\n\nDate:\n${dateStr}\n\nTime:\n${timeStr}\n\nGrievance / Request:\n"${grievance}"\n\nConversation Summary:\n${conversationSummary || 'None'}\n\nNivara's Response:\n${nivaraResponse || 'Personalized guidance provided in sanctuary'}\n\nSuggested Next Step:\n${suggestedNextStep || 'Follow the step-by-step action plan in sanctuary'}\n\nReference ID:\n${refId}`;

  const apiKey = (env.RESEND_API_KEY || process.env.RESEND_API_KEY || '').trim();
  const fromAddress = (
    env.FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    env.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    env.RESEND_FROM ||
    env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    'Nivara <onboarding@resend.dev>'
  ).trim();

  // If Resend API key is not configured, record in audit log and return clean failure
  if (!apiKey || apiKey === 're_your_api_key_here') {
    console.warn('[EMAIL] Failure: RESEND_API_KEY is not configured in environment');
    recordAuditLog({
      id: refId,
      recipient: candidateEmail,
      subject,
      dispatchedAt: timestamp,
      status: 'failed_missing_api_key',
      visitorName,
      visitorEmail,
      grievance,
      html: htmlContent,
      error: 'RESEND_API_KEY not configured'
    });

    return {
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message: "Something interrupted the delivery.\nYour conversation is still safe here.",
      referenceId: refId,
      recipient: candidateEmail
    };
  }

  // Dispatch through Resend
  console.log(`[EMAIL] Sending through Resend to candidate: ${candidateEmail}`);
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [candidateEmail],
      subject,
      html: htmlContent,
      text: plainText,
      headers: {
        'Idempotency-Key': refId
      }
    });

    console.log('[EMAIL] Resend response received:', error ? 'Error' : 'Success');

    if (error) {
      console.error('[EMAIL] Resend error details:', error.name, error.message);
      recordAuditLog({
        id: refId,
        recipient: candidateEmail,
        subject,
        dispatchedAt: timestamp,
        status: 'failed_resend_error',
        visitorName,
        visitorEmail,
        grievance,
        html: htmlContent,
        error: error.message
      });

      return {
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: "Something interrupted the delivery.\nYour conversation is still safe here.",
        referenceId: refId,
        recipient: candidateEmail
      };
    }

    const messageId = data?.id || refId;
    console.log(`[EMAIL] Success: notification dispatched with messageId ${messageId}`);

    recordAuditLog({
      id: refId,
      recipient: candidateEmail,
      subject,
      dispatchedAt: timestamp,
      status: 'delivered_resend',
      visitorName,
      visitorEmail,
      grievance,
      messageId,
      html: htmlContent
    });

    return {
      success: true,
      messageId,
      recipient: candidateEmail,
      referenceId: refId,
      deliveredAt: timestamp,
      message: "Your request has been sent.\nI've kept what you shared safe here too.\nYou can come back whenever you need."
    };
  } catch (err: any) {
    console.error('[EMAIL] Failure during Resend dispatch:', err?.message || err);
    recordAuditLog({
      id: refId,
      recipient: candidateEmail,
      subject,
      dispatchedAt: timestamp,
      status: 'failed_exception',
      visitorName,
      visitorEmail,
      grievance,
      html: htmlContent,
      error: err?.message || String(err)
    });

    return {
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message: "I couldn't deliver the notification just now. Your conversation is still safe here. You can try sending it again.",
      referenceId: refId,
      recipient: candidateEmail
    };
  }
}

/**
 * Standard help request notification function
 */
export const sendHelpRequestEmail = notifyCandidateViaResend;

/**
 * Backward compatibility wrappers
 */
export async function sendSolutionViaResend(payload: any): Promise<any> {
  return notifyCandidateViaResend({
    name: payload.name,
    visitorEmail: payload.email,
    grievance: payload.problem,
    conversationSummary: payload.conversationSummary || payload.solution
  });
}

export async function dispatchGuidanceEmail(payload: any): Promise<any> {
  return notifyCandidateViaResend({
    name: payload.userName || payload.name,
    visitorEmail: payload.recipientEmail || payload.email,
    grievance: payload.problem,
    conversationSummary: payload.understood || payload.solutionText
  });
}
