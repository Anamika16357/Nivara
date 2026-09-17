/**
 * Client-side Chat & Guidance Service
 * Talks exclusively to secure server-side endpoints without exposing API keys.
 */

export interface ChatHistoryItem {
  role: 'user' | 'model' | 'assistant';
  text?: string;
  content?: string;
  timestamp?: number;
}

export interface UserProfile {
  name?: string;
  age?: number | string;
  location?: string;
  email?: string;
}

export interface SolutionPlan {
  title: string;
  problem: string;
  understood: string;
  whyHappening?: string;
  nextStep: string;
  actionSteps: string[];
  firstStep: string;
  encouragement: string;
}

export interface ChatServiceResponse {
  success: boolean;
  reply: string;
  solutionPlan?: SolutionPlan;
  isSolution?: boolean;
  shouldGenerateSolution?: boolean;
  shouldSendEmail?: boolean;
  state?: string;
  conversationSummary?: string;
  modelUsed?: string;
  error?: string;
}

export interface CandidateNotificationPayload {
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

export interface CandidateNotificationResult {
  success: boolean;
  message: string;
  messageId?: string;
  referenceId?: string;
  error?: string;
}

export interface SendSolutionPayload {
  name?: string;
  email: string;
  problem: string;
  solution: string;
  conversationSummary?: string;
  nextStep?: string;
  idempotencyKey?: string;
}

export interface SendSolutionResult {
  success: boolean;
  message: string;
  messageId?: string;
  referenceId?: string;
  error?: string;
}

export interface SendEmailPayload {
  recipientEmail: string;
  userName?: string;
  problem: string;
  understood?: string;
  guidance: string;
  solutionText?: string;
  nextSteps?: string[];
  firstStep?: string;
  encouragement?: string;
}

export interface EmailServiceResponse {
  success: boolean;
  message: string;
  referenceId?: string;
  smtpDelivered?: boolean;
  previewUrl?: string;
  error?: string;
}

/**
 * Send message to secure server-side Gemini conversational endpoint
 */
export async function sendChatMessage(params: {
  message: string;
  history?: ChatHistoryItem[];
  userProfile?: UserProfile;
  situation?: string;
  context?: string;
  stage?: string;
  conversationStage?: string;
  explorationCount?: number;
  followUpCount?: number;
  action?: 'chat' | 'generate_solution';
}): Promise<ChatServiceResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      return {
        success: false,
        reply: "I lost the thread for a moment. Give me another try — I'm still here."
      };
    }

    const data = await res.json();
    return {
      success: data.success !== false,
      reply: data.reply || "I'm listening with you.",
      solutionPlan: data.solutionPlan,
      isSolution: data.isSolution,
      shouldGenerateSolution: data.shouldGenerateSolution,
      shouldSendEmail: data.shouldSendEmail,
      state: data.state,
      conversationSummary: data.conversationSummary,
      modelUsed: data.modelUsed
    };
  } catch (err: any) {
    console.error('[ChatService Error]:', err);
    return {
      success: false,
      reply: "I lost the thread for a moment. Give me another try — I'm still here.",
      error: err?.message || String(err)
    };
  }
}

/**
 * Send personal action plan via official Resend endpoint
 */
export async function sendSolutionEmail(payload: SendSolutionPayload): Promise<SendSolutionResult> {
  try {
    const res = await fetch('/api/send-solution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return {
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: "I couldn't deliver the email just now. Your plan is still safe here in our conversation."
      };
    }

    const data = await res.json();
    return {
      success: data.success === true,
      message:
        data.message ||
        (data.success
          ? `Done. I've sent your personal action plan to ${payload.email}. Give it a moment to arrive.`
          : "I couldn't deliver the email just now. Your plan is still safe here in our conversation."),
      messageId: data.messageId,
      referenceId: data.referenceId,
      error: data.error
    };
  } catch (err: any) {
    console.error('[sendSolutionEmail Error]:', err);
    return {
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message: "I couldn't deliver the email just now. Your plan is still safe here in our conversation."
    };
  }
}

/**
/**
 * Send candidate superhero notification via server-side Resend API route (/api/send-help-request)
 */
export async function sendHelpRequest(
  payload: CandidateNotificationPayload
): Promise<CandidateNotificationResult> {
  try {
    const res = await fetch('/api/send-help-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return {
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: "Something interrupted the delivery.\nYour conversation is still safe here."
      };
    }

    const data = await res.json();
    return {
      success: data.success === true,
      message:
        data.message ||
        (data.success
          ? "Your request has been sent.\nI've kept what you shared safe here too.\nYou can come back whenever you need."
          : "Something interrupted the delivery.\nYour conversation is still safe here."),
      messageId: data.messageId,
      referenceId: data.referenceId,
      error: data.error
    };
  } catch (err: any) {
    console.error('[sendHelpRequest Error]:', err);
    return {
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message: "Something interrupted the delivery.\nYour conversation is still safe here."
    };
  }
}

export const notifyCandidate = sendHelpRequest;

/**
 * Backward compatible guidance email dispatcher
 */
export async function sendGuidanceEmail(payload: SendEmailPayload): Promise<EmailServiceResponse> {
  const result = await sendSolutionEmail({
    email: payload.recipientEmail,
    name: payload.userName,
    problem: payload.problem,
    solution: payload.solutionText || payload.guidance,
    conversationSummary: payload.understood,
    nextStep: payload.firstStep
  });

  return {
    success: result.success,
    message: result.message,
    referenceId: result.referenceId,
    smtpDelivered: result.success,
    previewUrl: '/api/latest-email',
    error: result.error
  };
}
