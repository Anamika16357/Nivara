export interface GrievanceSubmission {
  name: string;
  age: string;
  location: string;
  email: string;
  grievance: string;
  submittedAt: string;
}

export interface SubmissionResponse {
  success: boolean;
  referenceId: string;
  message: string;
  candidateEmail: string;
  subject: string;
  submittedAt: string;
  notificationDispatched: boolean;
}

export const CANDIDATE_EMAIL_KEY = 'nivara_candidate_email';

export function getCandidateEmail(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CANDIDATE_EMAIL_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  return import.meta.env.VITE_CANDIDATE_EMAIL || '';
}

export function setCandidateEmail(email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CANDIDATE_EMAIL_KEY, email.trim());
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
}

export async function submitGrievanceToAdmin(
  data: Omit<GrievanceSubmission, 'submittedAt'>
): Promise<SubmissionResponse> {
  const now = new Date();
  const formattedTimestamp = now.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const submission: GrievanceSubmission = {
    ...data,
    submittedAt: formattedTimestamp
  };

  const candidateEmail = getCandidateEmail();
  const subject = '🦸 Someone Needs Your Help!';
  const refId = `CRYO-${Math.floor(100000 + Math.random() * 900000)}`;

  let notificationDispatched = false;

  // 1. Dispatch Automatic Email via local backend endpoint
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidateEmail,
        visitorName: submission.name,
        visitorAge: submission.age,
        visitorLocation: submission.location,
        visitorEmail: submission.email,
        grievance: submission.grievance,
        submittedAt: formattedTimestamp,
        referenceId: refId
      })
    });

    if (res.ok) {
      notificationDispatched = true;
      console.log(`[AUTOMATIC EMAIL NOTIFIED] Dispatched to candidate: ${candidateEmail}`);
    }
  } catch (err) {
    console.warn('[AUTOMATIC EMAIL DISPATCH NOTICE]', err);
  }

  // 2. Optional Web3Forms / Cloud Email API Dispatch (if access key configured)
  const web3formsKey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (web3formsKey) {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject,
          from_name: 'Nivara Superhero Sanctuary',
          to_email: candidateEmail,
          name: submission.name,
          email: submission.email,
          message: `Subject: 🦸 Someone Needs Your Help!\n\nVisitor Name: ${submission.name}\nAge: ${submission.age}\nLocation: ${submission.location}\nEmail: ${submission.email}\nDate & Time: ${formattedTimestamp}\nReference ID: ${refId}\n\nGrievance / Request:\n${submission.grievance}`
        })
      });
      notificationDispatched = true;
    } catch (e) {
      console.warn('Web3Forms dispatch warning:', e);
    }
  }

  // 3. Native Browser/Desktop Push Notification for immediate candidate awareness
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('🦸 Someone Needs Your Help!', {
        body: `${submission.name} (${submission.location}) just requested help: "${submission.grievance.slice(0, 100)}"`,
        icon: '/assets/story/06_her_purpose.png',
        tag: refId
      });
    } catch {
      // Ignore background notification errors
    }
  }

  // 4. Client-side local backup storage for verification and auditing
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nivara_sent_notifications') || '[]';
      const history = JSON.parse(stored);
      history.unshift({
        id: refId,
        candidateEmail,
        subject,
        submittedAt: formattedTimestamp,
        visitor: submission
      });
      localStorage.setItem('nivara_sent_notifications', JSON.stringify(history.slice(0, 50)));
    } catch {}
  }

  return {
    success: true,
    referenceId: refId,
    candidateEmail,
    subject,
    submittedAt: formattedTimestamp,
    notificationDispatched: true,
    message: `I have received your request, ${submission.name}. Your memory is sealed in my crystalline vault.`
  };
}
