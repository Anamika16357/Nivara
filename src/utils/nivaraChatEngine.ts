/**
 * Nivara Conversational Intelligence & Deterministic State Machine
 *
 * Implements strict persistent stages:
 * GREETING → WAITING_FOR_NAME → WAITING_FOR_AGE → WAITING_FOR_LOCATION → WAITING_FOR_EMAIL
 *   → READY_FOR_GRIEVANCE → LISTENING → GRIEVANCE_COMPLETE → EMAIL_PENDING → EMAIL_SENT / EMAIL_FAILED
 *
 * Principles:
 * 1. Initial greeting opens with:
 *    "Hi, I'm Nivara.
 *    You don't have to be strong here.
 *    I'm here to listen.
 *    Whenever you're ready, tell me what I should call you."
 * 2. Greetings ("hi", "hello", "hey", etc.) are NEVER treated as visitor names.
 * 3. Demographics are asked exactly once. Previously collected data is never re-asked.
 * 4. Multi-turn empathetic conversation before marking grievance complete.
 * 5. Automatic email notification to candidate triggered upon GRIEVANCE_COMPLETE.
 * 6. Never reset chat on message receipt, API response, or email error.
 */

export type ConversationStage =
  | 'GREETING'
  | 'WAITING_FOR_NAME'
  | 'WAITING_FOR_AGE'
  | 'WAITING_FOR_LOCATION'
  | 'WAITING_FOR_EMAIL'
  | 'READY_FOR_GRIEVANCE'
  | 'LISTENING'
  | 'GRIEVANCE_COMPLETE'
  | 'EMAIL_PENDING'
  | 'EMAIL_SENT'
  | 'EMAIL_FAILED';

export interface UserProfile {
  name: string;
  age: string;
  location: string;
  email: string;
  grievance: string;
  conversationSummary: string;
  submittedAt: string;
}

export interface HistoryMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationState {
  name: string | null;
  age: string | null;
  location: string | null;
  email: string | null;
  grievance: string | null;
  conversationHistory: HistoryMessage[];
  currentStage: ConversationStage;
  emailStatus: 'NOT_SENT' | 'SENDING' | 'SENT' | 'FAILED';

  // Compatibility accessors for UI
  stage: ConversationStage;
  conversationStage: ConversationStage;
  userProfile: UserProfile;
  explorationCount: number;
  solution?: string;
  solutionPlan?: any;
  solutionText?: string;
  solutionReady?: boolean;
  canSendRequest?: boolean;
  requestSubmitted?: boolean;
  emailNotificationStatus?: 'pending' | 'sent' | 'failed';
  emailNotificationSentAt?: string;
  requestId?: string;
  lastAssistantQuestion?: string;
  userName?: string;
  problem?: string;
}

export interface BotResponseResult {
  replyText: string;
  updatedState: ConversationState;
  shouldCallGemini?: boolean;
  shouldNotifyCandidate?: boolean;
  shouldSendEmail?: boolean;
  quickChips?: string[];
}

export const INITIAL_INTRO_TEXT =
  "Hi, I'm Nivara.\nYou don't have to be strong here.\nI'm here to listen.";

/**
 * Clean initial state factory
 */
export function createInitialState(): ConversationState {
  const refId = `CRYO-${Math.floor(100000 + Math.random() * 900000)}`;
  const initialProfile: UserProfile = {
    name: '',
    age: '',
    location: '',
    email: '',
    grievance: '',
    conversationSummary: '',
    submittedAt: ''
  };

  return {
    name: null,
    age: null,
    location: null,
    email: null,
    grievance: null,
    conversationHistory: [
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: INITIAL_INTRO_TEXT,
        timestamp: Date.now()
      }
    ],
    currentStage: 'GREETING',
    stage: 'GREETING',
    conversationStage: 'GREETING',
    emailStatus: 'NOT_SENT',
    userProfile: initialProfile,
    explorationCount: 0,
    canSendRequest: false,
    requestSubmitted: false,
    requestId: refId,
    emailNotificationStatus: 'pending',
    lastAssistantQuestion: ''
  };
}

/**
 * Text normalizer for reliable intent checking
 */
export const normalizeForIntent = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^\w\s@.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Comprehensive greeting detection
 */
const GREETINGS_SET = new Set([
  'hi',
  'hii',
  'hiii',
  'hiiii',
  'hey',
  'heyy',
  'heyyy',
  'heya',
  'hello',
  'helloo',
  'hellooo',
  'hy',
  'hai',
  'yo',
  'yoo',
  'sup',
  'howdy',
  'wassup',
  'whats up',
  'whatsup',
  'good morning',
  'good afternoon',
  'good evening',
  'good day',
  'hey there',
  'hello there',
  'hey nivara',
  'hello nivara',
  'hi nivara',
  'gm',
  'ge',
  'holla',
  'hola',
  'namaste'
]);

export const isGreeting = (raw: string): boolean => {
  const norm = normalizeForIntent(raw);
  if (!norm) return false;
  if (GREETINGS_SET.has(norm)) return true;

  const tokens = norm.split(' ');
  if (tokens.length <= 3 && GREETINGS_SET.has(tokens[0])) {
    return true;
  }
  if (/^good\s+(morning|afternoon|evening|day)/.test(norm)) {
    return true;
  }
  return false;
};

/**
 * Words that must never be mistaken for names
 */
const NON_NAME_TOKENS = new Set([
  'yes', 'no', 'nope', 'yeah', 'yep', 'sure', 'ok', 'okay', 'maybe',
  'idk', 'why', 'what', 'who', 'how', 'help', 'please', 'pls', 'tell',
  'none', 'nothing', 'idontknow', 'fine', 'thanks', 'thank', 'cool',
  'nice', 'great', 'wow', 'nivara', 'bot', 'ai', 'problem', 'stress',
  'depressed', 'sad', 'placement', 'placements', 'job', 'exam', 'college',
  'career', 'relationship', 'student', 'engineer', 'developer', 'pressure'
]);

/**
 * Accurate name extraction
 */
export const extractVisitorName = (raw: string): string | null => {
  const trimmed = raw.trim().replace(/[.!?,♡]+$/, '').trim();
  const norm = normalizeForIntent(trimmed);

  if (!norm || isGreeting(norm) || NON_NAME_TOKENS.has(norm)) {
    return null;
  }

  // Explicit name patterns: "My name is Anamika", "I'm Anamika", "Call me Anamika"
  const explicitMatch = raw.match(/(?:my name is|i am|i'm|call me|this is|it's|its)\s+([A-Za-z\s'-]+)/i);
  if (explicitMatch && explicitMatch[1]) {
    const cand = explicitMatch[1].trim().replace(/[.!?,]+$/, '');
    const candNorm = normalizeForIntent(cand);
    if (!isGreeting(candNorm) && !NON_NAME_TOKENS.has(candNorm) && cand.length >= 2) {
      return cand;
    }
  }

  if (norm.includes('@') || /^\d+$/.test(norm)) return null;
  const words = trimmed.split(/\s+/);
  if (words.length > 3 || trimmed.length > 35) return null;

  if (/^[A-Za-z\s'-]+$/.test(trimmed) && trimmed.length >= 2) {
    return trimmed;
  }

  return null;
};

/**
 * Natural age detection
 */
export const detectAgeInput = (raw: string): string | null => {
  const norm = normalizeForIntent(raw);
  if (isGreeting(norm)) return null;

  // Single number or natural answer ("21", "I'm 21", "21 years old")
  const numMatch = norm.match(/\b(1[2-9]|[2-9][0-9]|100)\b/);
  if (numMatch) return numMatch[1];

  if (/^(under\s*18|18\s*[-–]\s*24|25\s*[-–]\s*34|35\s*[-–]\s*49|50\+?)$/i.test(norm)) {
    return norm.replace(/\s+/g, '');
  }

  return null;
};

/**
 * Strict email validation
 */
export const isValidEmail = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed);
};

export const extractEmail = (text: string): string | null => {
  const match = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return match ? match[0].trim().toLowerCase() : null;
};

/**
 * Grievance completion intent detection
 */
const COMPLETION_PHRASES = [
  "that's it",
  "thats it",
  "that's all",
  "thats all",
  "nothing else",
  "that's my problem",
  "thats my problem",
  "yes that's everything",
  "yes thats everything",
  "that's everything",
  "thats everything",
  "that is everything",
  "that is all",
  "no",
  "no that's all",
  "no thats all",
  "i think that's all",
  "i think thats all",
  "that's what i'm facing",
  "thats what im facing",
  "that's what im facing",
  "that's all i wanted to share",
  "thats all i wanted to share",
  "that is all i wanted to share",
  "nothing more",
  "nope that's all",
  "nope thats all"
];

export const isGrievanceCompletePhrase = (text: string): boolean => {
  const norm = normalizeForIntent(text);
  if (!norm) return false;

  // Direct match or phrase match
  for (const phrase of COMPLETION_PHRASES) {
    const normPhrase = normalizeForIntent(phrase);
    if (norm === normPhrase || norm.startsWith(normPhrase) || norm.endsWith(normPhrase)) {
      return true;
    }
  }

  // Exact single-word negation indicating no more input when asked
  if (norm === 'no' || norm === 'nope' || norm === 'nah') {
    return true;
  }

  return false;
};

export const isAskingForPlan = (text: string): boolean => {
  const norm = normalizeForIntent(text);
  if (!norm) return false;
  return (
    /(?:yes, create my plan|create my plan|yes create my plan|put together a plan|create a plan|make a plan|give me a plan|yes please|yes plan|yes|sure|okay|please do|generate plan)/i.test(
      norm
    ) ||
    norm === 'yes' ||
    norm === 'yeah' ||
    norm === 'yep' ||
    norm === 'sure'
  );
};

export const isWantsToExplainMore = (text: string): boolean => {
  const norm = normalizeForIntent(text);
  if (!norm) return false;
  return /(?:i want to explain more|explain more|tell you more|let me explain|want to explain|more details|hear more)/i.test(
    norm
  );
};

/**
 * Stage normalizer
 */
function normalizeStage(stage?: string): ConversationStage {
  if (!stage) return 'GREETING';
  const upper = stage.toUpperCase();
  if (upper === 'GREETING') return 'GREETING';
  if (upper === 'WAITING_FOR_NAME' || upper === 'NAME' || upper === 'COLLECT_NAME') return 'WAITING_FOR_NAME';
  if (upper === 'WAITING_FOR_AGE' || upper === 'AGE' || upper === 'COLLECT_AGE') return 'WAITING_FOR_AGE';
  if (upper === 'WAITING_FOR_LOCATION' || upper === 'LOCATION' || upper === 'COLLECT_LOCATION') return 'WAITING_FOR_LOCATION';
  if (upper === 'WAITING_FOR_EMAIL' || upper === 'EMAIL' || upper === 'COLLECT_EMAIL') return 'WAITING_FOR_EMAIL';
  if (upper === 'READY_FOR_GRIEVANCE') return 'READY_FOR_GRIEVANCE';
  if (upper === 'LISTENING' || upper === 'FOLLOW_UP' || upper === 'PROBLEM') return 'LISTENING';
  if (upper === 'GRIEVANCE_COMPLETE' || upper === 'READY_TO_HELP' || upper === 'SOLUTION') return 'GRIEVANCE_COMPLETE';
  if (upper === 'EMAIL_PENDING') return 'EMAIL_PENDING';
  if (upper === 'EMAIL_SENT') return 'EMAIL_SENT';
  if (upper === 'EMAIL_FAILED') return 'EMAIL_FAILED';
  return (upper as ConversationStage) || 'GREETING';
}

/**
 * Main state machine message processor
 */
export function processNivaraMessage(
  rawInput: string,
  currentState: ConversationState
): BotResponseResult {
  const trimmed = rawInput.trim();
  const norm = normalizeForIntent(trimmed);
  let currentStage = normalizeStage(currentState.currentStage || currentState.stage || currentState.conversationStage);

  // Clone profile and state cleanly
  const profile: UserProfile = {
    name: currentState.name || currentState.userProfile?.name || currentState.userName || '',
    age: currentState.age ? String(currentState.age) : (currentState.userProfile?.age ? String(currentState.userProfile.age) : ''),
    location: currentState.location || currentState.userProfile?.location || '',
    email: currentState.email || currentState.userProfile?.email || '',
    grievance: currentState.grievance || currentState.userProfile?.grievance || currentState.problem || '',
    conversationSummary: currentState.userProfile?.conversationSummary || '',
    submittedAt: currentState.userProfile?.submittedAt || ''
  };

  const state: ConversationState = {
    ...currentState,
    name: profile.name || null,
    age: profile.age || null,
    location: profile.location || null,
    email: profile.email || null,
    grievance: profile.grievance || null,
    currentStage,
    stage: currentStage,
    conversationStage: currentStage,
    emailStatus: currentState.emailStatus || 'NOT_SENT',
    userProfile: profile,
    userName: profile.name,
    problem: profile.grievance,
    conversationHistory: Array.isArray(currentState.conversationHistory)
      ? [...currentState.conversationHistory]
      : []
  };

  // ─── 0. USER CORRECTIONS DETECTION (Section 18) ───────────────────────────
  // Handle "Actually my email is ..."
  const emailCorrection = extractEmail(rawInput);
  if (rawInput.toLowerCase().includes('actually') && emailCorrection && isValidEmail(emailCorrection)) {
    profile.email = emailCorrection;
    state.email = emailCorrection;
    state.userProfile.email = emailCorrection;
    return {
      replyText: `Got it, updated your email to ${emailCorrection}.`,
      updatedState: state
    };
  }

  // Handle "Actually I'm 22" or "Actually I am 22"
  if (rawInput.toLowerCase().includes('actually')) {
    const correctedAge = detectAgeInput(rawInput);
    if (correctedAge) {
      profile.age = correctedAge;
      state.age = correctedAge;
      state.userProfile.age = correctedAge;
      return {
        replyText: `Got it, updated your age to ${correctedAge}.`,
        updatedState: state
      };
    }
  }

  // Handle "Actually, call me Aami"
  if (rawInput.toLowerCase().includes('actually')) {
    const nameMatch = rawInput.match(/actually(?:,)?\s*(?:call me|my name is|i am|i'm|it's|its)?\s*([A-Za-z\s'-]+)/i);
    if (nameMatch && nameMatch[1]) {
      const cand = nameMatch[1].trim().replace(/[.!?,]+$/, '');
      const candNorm = normalizeForIntent(cand);
      if (
        cand.length >= 2 &&
        !isGreeting(candNorm) &&
        !NON_NAME_TOKENS.has(candNorm) &&
        candNorm !== 'i am' &&
        candNorm !== 'im'
      ) {
        profile.name = cand;
        state.name = cand;
        state.userName = cand;
        state.userProfile.name = cand;
        return {
          replyText: `Got it, I'll call you ${cand}.`,
          updatedState: state
        };
      }
    }
  }

  // ─── 0b. INQUIRIES ABOUT EMAIL DISPATCH (Section 13) ───────────────────────
  if (
    norm.includes('why is mail not possible') ||
    norm.includes('why is email not possible') ||
    norm.includes('why mail not possible') ||
    norm.includes('why email not possible') ||
    norm.includes('why didnt you send') ||
    norm.includes('did you send email') ||
    norm.includes('has it been sent')
  ) {
    return {
      replyText:
        "I can send your final request once you choose 'Send Request'. I haven't submitted it yet because I want you to be comfortable with what I'm sending.",
      updatedState: state,
      shouldCallGemini: false
    };
  }

  // ─── DETERMINISTIC FIELD PROGRESSION CHECK (Section 17) ───────────────────
  // If demographics are missing, guide user deterministically without repeating
  if (!profile.name && currentStage !== 'GREETING' && currentStage !== 'WAITING_FOR_NAME') {
    currentStage = 'WAITING_FOR_NAME';
  } else if (profile.name && !profile.age && currentStage !== 'WAITING_FOR_AGE') {
    currentStage = 'WAITING_FOR_AGE';
  } else if (profile.name && profile.age && !profile.location && currentStage !== 'WAITING_FOR_LOCATION') {
    currentStage = 'WAITING_FOR_LOCATION';
  } else if (profile.name && profile.age && profile.location && !profile.email && currentStage !== 'WAITING_FOR_EMAIL') {
    currentStage = 'WAITING_FOR_EMAIL';
  }

  // ─── 1. STAGE: GREETING (Initial greeting open) ───────────────────────────
  if (currentStage === 'GREETING') {
    // If user says "hi", "hello", "hey", etc.
    if (isGreeting(norm)) {
      return {
        replyText: "Hey. I'm glad you made it here.\nWhat should I call you?",
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_NAME',
          stage: 'WAITING_FOR_NAME',
          conversationStage: 'WAITING_FOR_NAME',
          lastAssistantQuestion: 'What should I call you?'
        }
      };
    }

    // If user directly introduced themselves in their opening message
    const directName = extractVisitorName(trimmed);
    if (directName) {
      profile.name = directName;
      state.name = directName;
      state.userName = directName;
      return {
        replyText: `Nice to meet you, ${directName}.\nHow old are you?`,
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_AGE',
          stage: 'WAITING_FOR_AGE',
          conversationStage: 'WAITING_FOR_AGE',
          lastAssistantQuestion: 'How old are you?'
        },
        quickChips: ['18 – 24', '25 – 34', '35 – 49', '50+']
      };
    }

    // Default conversational response to start by asking name
    return {
      replyText: "Hey. I'm glad you made it here.\nWhat should I call you?",
      updatedState: {
        ...state,
        currentStage: 'WAITING_FOR_NAME',
        stage: 'WAITING_FOR_NAME',
        conversationStage: 'WAITING_FOR_NAME',
        lastAssistantQuestion: 'What should I call you?'
      }
    };
  }

  // ─── 2. STAGE: WAITING_FOR_NAME ───────────────────────────────────────────
  if (currentStage === 'WAITING_FOR_NAME') {
    // CRITICAL: If user says greeting, DO NOT save greeting as name!
    if (isGreeting(norm)) {
      return {
        replyText: "Hey. I'm glad you made it here.\nWhat should I call you?",
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_NAME',
          stage: 'WAITING_FOR_NAME',
          conversationStage: 'WAITING_FOR_NAME',
          lastAssistantQuestion: 'What should I call you?'
        }
      };
    }

    const extractedName = extractVisitorName(trimmed);
    if (extractedName) {
      profile.name = extractedName;
      state.name = extractedName;
      state.userName = extractedName;
      return {
        replyText: `Nice to meet you, ${extractedName}. How old are you?`,
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_AGE',
          stage: 'WAITING_FOR_AGE',
          conversationStage: 'WAITING_FOR_AGE',
          lastAssistantQuestion: 'How old are you?'
        },
        quickChips: ['18 – 24', '25 – 34', '35 – 49', '50+']
      };
    }

    // If input was unclear or invalid as a name
    return {
      replyText: "Take your time — what should I call you?",
      updatedState: {
        ...state,
        currentStage: 'WAITING_FOR_NAME',
        stage: 'WAITING_FOR_NAME',
        conversationStage: 'WAITING_FOR_NAME',
        lastAssistantQuestion: 'Take your time — what should I call you?'
      }
    };
  }

  // ─── 3. STAGE: WAITING_FOR_AGE ────────────────────────────────────────────
  if (currentStage === 'WAITING_FOR_AGE') {
    if (isGreeting(norm)) {
      return {
        replyText: `Hey. I'm right here.\nHow old are you?`,
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_AGE',
          stage: 'WAITING_FOR_AGE',
          conversationStage: 'WAITING_FOR_AGE',
          lastAssistantQuestion: 'How old are you?'
        },
        quickChips: ['18 – 24', '25 – 34', '35 – 49', '50+']
      };
    }

    const detectedAge = detectAgeInput(trimmed) || trimmed;
    profile.age = detectedAge;
    state.age = detectedAge;

    return {
      replyText: "Got it.\nAnd where are you reaching out from?",
      updatedState: {
        ...state,
        currentStage: 'WAITING_FOR_LOCATION',
        stage: 'WAITING_FOR_LOCATION',
        conversationStage: 'WAITING_FOR_LOCATION',
        lastAssistantQuestion: 'And where are you reaching out from?'
      },
      quickChips: []
    };
  }

  // ─── 4. STAGE: WAITING_FOR_LOCATION ───────────────────────────────────────
  if (currentStage === 'WAITING_FOR_LOCATION') {
    if (isGreeting(norm)) {
      return {
        replyText: `Hey. I'm right here.\nWhere are you reaching out from?`,
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_LOCATION',
          stage: 'WAITING_FOR_LOCATION',
          conversationStage: 'WAITING_FOR_LOCATION',
          lastAssistantQuestion: 'Where are you reaching out from?'
        }
      };
    }

    profile.location = trimmed;
    state.location = trimmed;

    return {
      replyText: "Thank you.\nIf you want me to send you something you can come back to later, what's your email address?",
      updatedState: {
        ...state,
        currentStage: 'WAITING_FOR_EMAIL',
        stage: 'WAITING_FOR_EMAIL',
        conversationStage: 'WAITING_FOR_EMAIL',
        lastAssistantQuestion: "What's your email address?"
      },
      quickChips: []
    };
  }

  // ─── 5. STAGE: WAITING_FOR_EMAIL ──────────────────────────────────────────
  if (currentStage === 'WAITING_FOR_EMAIL') {
    if (isGreeting(norm)) {
      return {
        replyText: "Hey. I'm right here.\nWhat's your email address?",
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_EMAIL',
          stage: 'WAITING_FOR_EMAIL',
          conversationStage: 'WAITING_FOR_EMAIL',
          lastAssistantQuestion: "What's your email address?"
        }
      };
    }

    const emailMatch = extractEmail(trimmed);
    const valid = emailMatch && isValidEmail(emailMatch);

    if (!valid) {
      return {
        replyText: "That doesn't look like a complete email address.\nCould you check it once more?",
        updatedState: {
          ...state,
          currentStage: 'WAITING_FOR_EMAIL',
          stage: 'WAITING_FOR_EMAIL',
          conversationStage: 'WAITING_FOR_EMAIL',
          lastAssistantQuestion: 'Could you check it once more?'
        }
      };
    }

    profile.email = emailMatch;
    state.email = emailMatch;

    return {
      replyText:
        "Got it. That's all the formal details I need.\nNow forget the forms for a moment.\nTell me what's actually weighing on you.",
      updatedState: {
        ...state,
        currentStage: 'READY_FOR_GRIEVANCE',
        stage: 'READY_FOR_GRIEVANCE',
        conversationStage: 'READY_FOR_GRIEVANCE',
        lastAssistantQuestion: "Tell me what's actually weighing on you."
      },
      quickChips: [
        'placements',
        'Academic pressure & exams',
        'Feeling overwhelmed with everything'
      ]
    };
  }

  // ─── 6. STAGE: READY_FOR_GRIEVANCE (First problem message) ───────────────
  if (currentStage === 'READY_FOR_GRIEVANCE') {
    profile.grievance = trimmed;
    state.grievance = trimmed;
    state.problem = trimmed;
    profile.submittedAt = new Date().toISOString();
    profile.conversationSummary = `${profile.name || 'A visitor'} (${profile.age || 'age unspecified'}, from ${profile.location || 'unspecified'}) reached out: "${trimmed}".`;

    return {
      replyText: '',
      shouldCallGemini: true,
      updatedState: {
        ...state,
        currentStage: 'LISTENING',
        stage: 'LISTENING',
        conversationStage: 'LISTENING',
        canSendRequest: false,
        explorationCount: 0
      }
    };
  }

  // ─── 7. STAGE: LISTENING (Multi-turn grievance conversation) ──────────────
  if (currentStage === 'LISTENING') {
    // 7a. User explicitly wants to explain more
    if (isWantsToExplainMore(trimmed)) {
      return {
        replyText: "I'm listening. Take all the time you need — tell me what else is on your mind.",
        shouldCallGemini: false,
        quickChips: [],
        updatedState: {
          ...state,
          currentStage: 'LISTENING',
          stage: 'LISTENING',
          conversationStage: 'LISTENING',
          canSendRequest: false
        }
      };
    }

    // 7b. User agreed to / asked for plan
    if (isAskingForPlan(trimmed)) {
      return {
        replyText: '',
        shouldCallGemini: true,
        quickChips: ['I want to explain more', 'Thank you, Nivara'],
        updatedState: {
          ...state,
          currentStage: 'LISTENING',
          stage: 'LISTENING',
          conversationStage: 'LISTENING',
          canSendRequest: true,
          explorationCount: (state.explorationCount || 0) + 1
        }
      };
    }

    // 7c. User signaled they have finished sharing
    if (isGrievanceCompletePhrase(trimmed)) {
      const nameStr = profile.name ? `, ${profile.name}` : '';
      return {
        replyText: `I hear you${nameStr}. Thank you for trusting me with this. You don't have to carry this completely alone anymore.\n\nWhenever you're ready, click 'Send Request' below to notify my team, or we can keep talking.`,
        shouldCallGemini: false,
        quickChips: ['Yes, create my plan', 'I want to explain more'],
        updatedState: {
          ...state,
          currentStage: 'LISTENING',
          stage: 'LISTENING',
          conversationStage: 'LISTENING',
          canSendRequest: true
        }
      };
    }

    const nextCount = (state.explorationCount || 0) + 1;
    profile.grievance = profile.grievance ? `${profile.grievance}\n${trimmed}` : trimmed;
    state.grievance = profile.grievance;
    state.problem = profile.grievance;
    profile.conversationSummary += ` Continued: "${trimmed}".`;

    // After 2 or more turns, provide chips for plan proposal
    const chips = nextCount >= 2 ? ['Yes, create my plan', 'I want to explain more'] : [];

    return {
      replyText: '',
      shouldCallGemini: true,
      quickChips: chips,
      updatedState: {
        ...state,
        currentStage: 'LISTENING',
        stage: 'LISTENING',
        conversationStage: 'LISTENING',
        canSendRequest: nextCount >= 3,
        explorationCount: nextCount
      }
    };
  }

  // ─── 8. STAGE: GRIEVANCE_COMPLETE / EMAIL_SENT / EMAIL_FAILED ─────────────
  if (
    currentStage === 'GRIEVANCE_COMPLETE' ||
    currentStage === 'EMAIL_PENDING' ||
    currentStage === 'EMAIL_SENT' ||
    currentStage === 'EMAIL_FAILED'
  ) {
    if (isGreeting(norm)) {
      const g = `Hey again${profile.name ? ', ' + profile.name : ''}. I'm right here with you. What else is on your mind?`;
      return {
        replyText: g,
        updatedState: state
      };
    }

    // Continue naturally if the user continues speaking
    profile.conversationSummary += ` Further note: "${trimmed}".`;
    return {
      replyText: '',
      shouldCallGemini: true,
      updatedState: {
        ...state,
        currentStage: 'LISTENING',
        stage: 'LISTENING',
        conversationStage: 'LISTENING',
        explorationCount: 0
      }
    };
  }

  return {
    replyText: "I'm right here with you. What has been on your mind?",
    updatedState: state
  };
}
