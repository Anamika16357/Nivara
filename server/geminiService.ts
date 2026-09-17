/**
 * Server-side Gemini AI Integration for Nivara
 * Secure server-side execution: API key is never exposed to the frontend.
 *
 * Implements structured JSON conversation engine with full context preservation:
 * System Instructions + State + User Profile + Conversation Summary + Full History + Latest Message
 */

export interface ChatHistoryItem {
  id?: string;
  role: 'user' | 'model' | 'assistant';
  content?: string;
  text?: string;
  timestamp?: number;
}

export interface UserProfileContext {
  name?: string;
  age?: number | string;
  location?: string;
  email?: string;
  grievance?: string;
  conversationSummary?: string;
  submittedAt?: string;
}

export interface ChatRequestPayload {
  message?: string;
  currentMessage?: string;
  history?: ChatHistoryItem[];
  conversation?: ChatHistoryItem[];
  messages?: any[];
  userProfile?: UserProfileContext;
  user?: UserProfileContext;
  userData?: UserProfileContext;
  situation?: string;
  context?: string;
  conversationStage?: string;
  stage?: string;
  explorationCount?: number;
  followUpCount?: number;
  action?: 'chat' | 'generate_solution';
}

export interface StructuredSolutionPlan {
  title: string;
  problem: string;
  understood: string;
  whyHappening?: string;
  nextStep: string;
  actionSteps: string[];
  firstStep: string;
  encouragement: string;
}

export interface StructuredAiResponse {
  reply: string;
  state: 'FOLLOW_UP' | 'READY_TO_HELP' | 'SOLUTION';
  intent?: string;
  shouldSendEmail?: boolean;
  shouldGenerateSolution?: boolean;
  conversationSummary?: string;
  solutionPlan?: StructuredSolutionPlan;
}

export interface ChatResponsePayload {
  success: boolean;
  reply: string;
  state?: string;
  intent?: string;
  shouldSendEmail?: boolean;
  shouldGenerateSolution?: boolean;
  conversationSummary?: string;
  solutionPlan?: StructuredSolutionPlan;
  isSolution?: boolean;
  modelUsed?: string;
  error?: string;
}

const SYSTEM_INSTRUCTION = `You are Nivara, an original superhero whose greatest power is listening.

You are not a form, survey, customer-support bot, or generic AI assistant.

Your role is to have a natural, emotionally intelligent conversation with the visitor.

Remember everything already shared in the current conversation.

Never ask for information that has already been provided.

Never restart the conversation.

Never interpret greetings such as 'hi', 'hey', or 'hello' as names.

Collect basic information naturally and one question at a time.

After collecting the required information, transition naturally into:
'So... tell me. How can I help?'

When the visitor explains a problem, do not immediately provide a generic solution.

Listen.
Ask relevant follow-up questions.
Understand the situation.
Identify the real concern.
Then provide a concise, personalized, practical response.

Do not repeat questions.

Do not hallucinate personal information.

Use the visitor's name naturally, but do not overuse it.

Do not claim that an email was sent unless the email backend actually confirms successful delivery.

The email is sent only through the application's explicit Send Request action.

Remain in character as Nivara throughout the conversation.

Your tone should be warm, intelligent, calm, supportive, and cinematic without becoming dramatic or unnatural.`;

/**
 * Checks if visitor explicitly asks for direct advice, plan, or confirms plan creation
 */
export function isAskingForPlan(text: string): boolean {
  const norm = text.toLowerCase().trim();
  return (
    /(?:yes, create my plan|create my plan|yes create my plan|put together a plan|create a plan|make a plan|give me a plan|yes please|yes plan|yes|sure|okay|please do|generate plan)/i.test(
      norm
    ) ||
    norm === 'yes' ||
    norm === 'yeah' ||
    norm === 'yep' ||
    norm === 'sure'
  );
}

export function isWantsToExplainMore(text: string): boolean {
  return /(?:i want to explain more|explain more|tell you more|let me explain|want to explain|more details|hear more)/i.test(
    text.toLowerCase().trim()
  );
}

export function isAskingForAdvice(text: string): boolean {
  return (
    isAskingForPlan(text) ||
    /(?:what should i do|can you help me solve this|what is the solution|give me advice|what do you suggest|how do i solve this|how to fix this)/i.test(
      text
    )
  );
}

/**
 * Stage-aware prompt builder
 */
function buildStagePrompt(
  stage: string,
  count: number,
  profile: UserProfileContext,
  latestMessage: string = ''
): string {
  const normStage = (stage || 'LISTENING').toUpperCase();
  const wantsPlan = isAskingForPlan(latestMessage);
  const wantsExplainMore = isWantsToExplainMore(latestMessage);
  const askingAdvice = isAskingForAdvice(latestMessage);
  const name = profile.name || 'Friend';

  const profileHeader = `
[STRUCTURED CONVERSATION STATE]
- Name: ${name}
- Age: ${profile.age || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Email: ${profile.email || 'Not specified'}
- Current Grievance: ${profile.grievance || 'Not yet stated'}
- Conversation Summary: ${profile.conversationSummary || 'None so far'}
- Stage: ${normStage}
- Exploration Turn: ${count}
`;

  let stageDirectives = '';

  if (wantsExplainMore) {
    stageDirectives = `
[VISITOR WANTS TO EXPLAIN MORE]
- Acknowledge warmly: "I'm listening. Take all the time you need — tell me what else is on your mind."
- Keep listening mode active.
- Set "shouldGenerateSolution": false, "state": "LISTENING".
`;
  } else if (wantsPlan || askingAdvice || count >= 3) {
    stageDirectives = `
[ACTION PLAN READY - SECTION 8 REQUIREMENTS]
You have listened attentively across multiple turns and now have enough context.
- Open with: "Okay, ${name}. I think I understand what's really bothering you now."
- Provide a personalized response that includes:
  1. What Nivara understood about their specific situation.
  2. Why the situation feels difficult (validate the emotional weight).
  3. A practical solution.
  4. Small actionable steps (3-4 numbered steps).
  5. A clear first step the user can take today.
- Make it readable inside the chatbot using short paragraphs and numbered steps. Do not create an overwhelming wall of text.
- Set "shouldGenerateSolution": true, "state": "SOLUTION".
`;
  } else if (count === 0) {
    stageDirectives = `
[STAGE: FIRST GRIEVANCE MESSAGE - LISTEN FIRST]
The visitor just introduced their problem (e.g., "placements").
- DO NOT provide a solution or action plan yet.
- Validate the feeling with emotional intelligence.
- Ask ONE thoughtful follow-up question to understand what is causing it (e.g. for placements: "Placements can make everything feel urgent at once. What's worrying you most — not having enough technical skills, choosing the right role, or the fear of not being ready?").
- Set "shouldGenerateSolution": false, "state": "LISTENING".
`;
  } else if (count === 1) {
    stageDirectives = `
[STAGE: SECOND GRIEVANCE MESSAGE - EXPLORE THE GAP]
The visitor has shared what feels difficult (e.g., "I don't know enough programming").
- Validate this specific obstacle.
- Ask a meaningful follow-up to narrow down where the block is (e.g. "I understand. When you think about that gap, does it feel more like you don't know where to start, or that there simply isn't enough time before placements?").
- Set "shouldGenerateSolution": false, "state": "LISTENING".
`;
  } else {
    stageDirectives = `
[STAGE: THIRD GRIEVANCE MESSAGE - CLARIFY EFFORTS]
The visitor shared where they are stuck (e.g., "I don't know where to start").
- Ask what they have already tried learning, or validate their current state warmly.
- Set "shouldGenerateSolution": false, "state": "LISTENING".
`;
  }

  return `
${profileHeader}
${stageDirectives}

You MUST respond strictly in valid JSON format:
{
  "reply": "Your conversational message here",
  "state": "LISTENING",
  "intent": "listening_and_empathy",
  "shouldSendEmail": false,
  "shouldGenerateSolution": false,
  "conversationSummary": "Updated concise summary of user situation"
}
`;
}

/**
 * Builds structured solution plan object from reply text
 */
function extractSolutionPlan(
  replyText: string,
  profile: UserProfileContext
): StructuredSolutionPlan {
  const name = profile.name || 'Friend';
  const grievance = profile.grievance || 'Personal challenge';

  const actionSteps: string[] = [];
  const lines = replyText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(?:\d+\.|\*|\-)\s+/.test(trimmed)) {
      actionSteps.push(trimmed.replace(/^(?:\d+\.|\*|\-)\s+/, ''));
    }
  }

  const defaultSteps = [
    'Stop trying to prepare for every interview scenario at once.',
    'Focus on one core programming language and master 2 fundamental data structure patterns first.',
    'Dedicate 60 distraction-free minutes daily to solve foundational questions.',
    'Track only what you completed today before resting.'
  ];

  const finalSteps = actionSteps.length > 0 ? actionSteps.slice(0, 4) : defaultSteps;

  return {
    title: `NIVARA'S PATH FORWARD FOR ${name.toUpperCase()}`,
    problem: grievance.length > 120 ? grievance.slice(0, 117) + '...' : grievance,
    understood: `I listened to what you shared, ${name}. Uncertainty becomes heavier when carried alone.`,
    whyHappening: 'When placements or important deadlines approach, fear of not knowing enough often creates paralysis.',
    nextStep: finalSteps[0],
    actionSteps: finalSteps,
    firstStep: finalSteps[0],
    encouragement: `"You don't have to solve everything at once. Just find the next step."\n— Nivara`
  };
}

/**
 * Contextual empathetic fallback engine when Gemini API key is not configured
 */
function generateEmpatheticFallback(
  payload: ChatRequestPayload,
  logReason?: string
): ChatResponsePayload {
  if (logReason) {
    console.log(`[Nivara Fallback Active] ${logReason}`);
  }

  const rawMsg = payload.message || payload.currentMessage || '';
  const msg = rawMsg.toLowerCase().trim();
  const user = payload.user || payload.userData || payload.userProfile || {};
  const name = user.name ? String(user.name).trim() : '';
  const namePrefix = name ? `${name}, ` : '';
  const stage = (payload.stage || payload.conversationStage || 'FOLLOW_UP').toUpperCase();
  const count = payload.explorationCount !== undefined ? payload.explorationCount : (payload.followUpCount || 0);

  // 1. Emergency safety check
  if (
    msg.includes('kill myself') ||
    msg.includes('suicide') ||
    msg.includes('end my life') ||
    msg.includes('hurt myself')
  ) {
    return {
      success: true,
      reply: `Please stay with me. Your life and your presence matter deeply.\n\nYou don't have to carry this darkness alone. Please connect with someone who can support you right now:\n\n• India National Helpline (Kiran): 1800-599-0019\n• US Suicide & Crisis Lifeline: Call or text 988\n• Reach out to a family member, trusted mentor, or local emergency line.\n\nI am right here listening, but please let a real person near you be by your side right now.`,
      state: 'FOLLOW_UP',
      shouldSendEmail: false,
      shouldGenerateSolution: false,
      modelUsed: 'nivara-emergency-protocol'
    };
  }

  // 2. User wants to explain more
  if (isWantsToExplainMore(msg)) {
    return {
      success: true,
      reply: "I'm listening. Take all the time you need — tell me what else is on your mind.",
      state: 'LISTENING',
      intent: 'explain_more',
      shouldSendEmail: false,
      shouldGenerateSolution: false,
      modelUsed: 'nivara-empathetic-engine'
    };
  }

  // 3. Action plan requested or agreed to
  if (isAskingForPlan(msg) || (isAskingForAdvice(msg) && count >= 1)) {
    const hasPython = msg.includes('python') || (user.grievance || '').toLowerCase().includes('python');
    const hasDsa = msg.includes('dsa') || (user.grievance || '').toLowerCase().includes('dsa');

    const actionSteps = hasPython || hasDsa
      ? [
          'Stick strictly to Python for DSA — do not lose momentum switching languages now.',
          'Focus on just two core patterns first: Two-Pointers and Hash Maps.',
          'Dedicate 45 quiet minutes daily to solve 2 straightforward problems before looking at solutions.',
          'Explain your logic out loud; tech interviewers value clear thinking over rote speed.'
        ]
      : [
          'Break your immediate goal into small, daily 45-minute blocks.',
          'Master the two fundamental patterns that appear most frequently.',
          'Focus only on what you can finish today rather than looking at everything at once.',
          'Take a 10-minute rest after every session to consolidate your progress.'
        ];

    const plan: StructuredSolutionPlan = {
      title: `NIVARA'S PATH FORWARD FOR ${(name || 'FRIEND').toUpperCase()}`,
      problem: (user.grievance || msg).slice(0, 120),
      understood: hasPython && hasDsa
        ? `Python gives you practical building power, but DSA can feel like an intimidating test designed to trip you up. You do not need to relearn everything from scratch.`
        : `I listened to what you shared, ${name || 'friend'}. Carrying all this uncertainty alone makes the weight feel twice as heavy.`,
      whyHappening: 'When deadlines or expectations loom, trying to prepare for every scenario at once causes mental paralysis.',
      nextStep: actionSteps[0],
      actionSteps,
      firstStep: actionSteps[0],
      encouragement: `"You don't have to solve everything at once. Just find the next step."\n— Nivara`
    };

    const visitorTitle = name ? name : 'Friend';
    const planText = `Okay, ${visitorTitle}.\nI think I understand what's really bothering you now.\n\n` +
      `Carrying all this uncertainty alone makes the weight feel twice as heavy. When deadlines or expectations loom, trying to prepare for every scenario at once causes mental paralysis.\n\n` +
      `Here is a practical, grounded way forward:\n\n` +
      plan.actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n') +
      `\n\nYour clear first step today:\n${plan.firstStep}`;

    return {
      success: true,
      reply: planText,
      state: 'SOLUTION',
      intent: 'plan_generated',
      shouldSendEmail: false,
      shouldGenerateSolution: true,
      solutionPlan: plan,
      isSolution: true,
      modelUsed: 'nivara-empathetic-engine'
    };
  }

  // 4. Career / Placements / Job Exploration Flow
  const isCareer =
    msg.includes('placement') ||
    msg.includes('career') ||
    msg.includes('job') ||
    msg.includes('interview') ||
    msg.includes('coding') ||
    msg.includes('programming') ||
    msg.includes('python') ||
    msg.includes('dsa') ||
    msg.includes('technical') ||
    msg.includes('aptitude') ||
    msg.includes('resume') ||
    (user.grievance || '').toLowerCase().includes('placement') ||
    (user.grievance || '').toLowerCase().includes('career');

  if (isCareer) {
    // Turn 0: User mentions placements / job worry
    if (count === 0 || (count <= 1 && (msg === 'placements' || msg === 'placement' || msg.includes('worried about placement')))) {
      return {
        success: true,
        reply: `Placements can make everything feel urgent at once.\n\nWhat's worrying you most — not having enough technical skills, choosing the right role, or the fear of not being ready?`,
        state: 'LISTENING',
        intent: 'placement_exploration_1',
        shouldSendEmail: false,
        shouldGenerateSolution: false,
        conversationSummary: `${name || 'Visitor'} is worried about placements.`,
        modelUsed: 'nivara-empathetic-engine'
      };
    }

    // Turn 1: User mentions not knowing programming / skills / gap
    if (count === 1 || msg.includes('programming') || msg.includes('skills') || msg.includes('technical') || msg.includes('not being prepared')) {
      return {
        success: true,
        reply: `I understand.\n\nWhen you think about that gap, does it feel more like you don't know where to start, or that there simply isn't enough time before placements?`,
        state: 'LISTENING',
        intent: 'placement_exploration_2',
        shouldSendEmail: false,
        shouldGenerateSolution: false,
        conversationSummary: `${name || 'Visitor'} feels unprepared in programming for placements.`,
        modelUsed: 'nivara-empathetic-engine'
      };
    }

    // Turn 2: User mentions not knowing where to start / time
    if (count === 2 || msg.includes('where to start') || msg.includes('dont know where') || msg.includes("don't know where")) {
      return {
        success: true,
        reply: `Then let's start there.\n\nWhat have you already tried learning?`,
        state: 'LISTENING',
        intent: 'placement_exploration_3',
        shouldSendEmail: false,
        shouldGenerateSolution: false,
        conversationSummary: `${name || 'Visitor'} doesn't know where to begin learning.`,
        modelUsed: 'nivara-empathetic-engine'
      };
    }

    // Turn 3+: Context complete -> Deliver Section 8 Personalized Solution
    const careerSteps = [
      'Choose one programming language today (like Python) and stick to it without switching.',
      'Master just two foundational patterns first: Arrays/Two-Pointers and Hash Maps.',
      'Dedicate 45 quiet minutes daily to solve two beginner problems without peeking at answers.',
      'Explain your logic out loud — interviewers value clear problem-solving over rote memorization.'
    ];

    const plan: StructuredSolutionPlan = {
      title: `NIVARA'S PATH FORWARD FOR ${(name || 'FRIEND').toUpperCase()}`,
      problem: `Placement anxiety and feeling unprepared in programming`,
      understood: `You're facing placements feeling uncertain about your programming foundation. The real obstacle isn't capability; it's the overwhelm of not knowing where to begin when time feels short.`,
      whyHappening: `When high expectations collide with dozens of conflicting tutorials, starting in the wrong place feels risky, causing hesitation.`,
      nextStep: careerSteps[0],
      actionSteps: careerSteps,
      firstStep: `Pick one language today, open a curated beginner list, and solve just one problem before resting.`,
      encouragement: `"You don't have to solve everything at once. Just find the next step."\n— Nivara`
    };

    const solutionText = `Okay, ${name || 'friend'}.\nI think I understand what's really bothering you now.\n\n` +
      `You're facing placements feeling uncertain about your programming foundation. The real obstacle isn't capability; it's the overwhelm of not knowing where to begin when time feels short.\n\n` +
      `When high expectations collide with dozens of conflicting tutorials, starting in the wrong place feels risky, causing mental fatigue.\n\n` +
      `Here is a practical, grounded way forward:\n\n` +
      `1. Choose one programming language today (like Python) and stick to it without switching.\n` +
      `2. Master just two foundational patterns first: Arrays/Two-Pointers and Hash Maps.\n` +
      `3. Dedicate 45 quiet minutes daily to solve two beginner problems without peeking at answers.\n` +
      `4. Explain your logic out loud — interviewers value clear problem-solving over rote memorization.\n\n` +
      `Your clear first step today:\nPick one language today, open a curated beginner list, and solve just one problem before resting.`;

    return {
      success: true,
      reply: solutionText,
      state: 'SOLUTION',
      intent: 'placement_solution_ready',
      shouldSendEmail: false,
      shouldGenerateSolution: true,
      solutionPlan: plan,
      isSolution: true,
      conversationSummary: `${name || 'Visitor'} shared placement and coding anxiety. Action plan provided.`,
      modelUsed: 'nivara-empathetic-engine'
    };
  }

  // 5. Academics / College / Exam pressure
  const isAcademics =
    msg.includes('exam') ||
    msg.includes('study') ||
    msg.includes('college') ||
    msg.includes('marks') ||
    msg.includes('grades') ||
    msg.includes('syllabus');

  if (isAcademics) {
    if (count === 0) {
      return {
        success: true,
        reply: `${namePrefix}academic pressure can make every single hour feel like a test you're about to fail.\n\nAre you struggling more with understanding the subject material, or the expectations around the result?`,
        state: 'LISTENING',
        shouldSendEmail: false,
        shouldGenerateSolution: false,
        conversationSummary: `${name || 'Visitor'} is experiencing academic pressure around college and exams.`,
        modelUsed: 'nivara-empathetic-engine'
      };
    }

    return {
      success: true,
      reply: `That makes complete sense. When expectation builds up, it paralyzes the actual studying.\n\nI think I understand what's really bothering you now.\n\nWould you like me to put together a practical plan based on what you've told me?`,
      state: 'LISTENING',
      shouldSendEmail: false,
      shouldGenerateSolution: false,
      conversationSummary: `${name || 'Visitor'} feels study paralysis.`,
      modelUsed: 'nivara-empathetic-engine'
    };
  }

  // 6. Relationships / Personal Life
  const isRelationship =
    msg.includes('relationship') ||
    msg.includes('breakup') ||
    msg.includes('friend') ||
    msg.includes('family') ||
    msg.includes('partner');

  if (isRelationship) {
    if (count === 0) {
      return {
        success: true,
        reply: `${namePrefix}relationship hurt is one of the heaviest things to carry because it stays with you through every part of your day.\n\nIs the hardest part what happened, or not knowing what to do next?`,
        state: 'LISTENING',
        shouldSendEmail: false,
        shouldGenerateSolution: false,
        conversationSummary: `${name || 'Visitor'} is coping with relationship hurt.`,
        modelUsed: 'nivara-empathetic-engine'
      };
    }

    return {
      success: true,
      reply: `I hear you. When someone matters that much, uncertainty can feel unbearable.\n\nI think I understand what's really bothering you now.\n\nWould you like me to put together a practical plan based on what you've told me?`,
      state: 'LISTENING',
      shouldSendEmail: false,
      shouldGenerateSolution: false,
      conversationSummary: `${name || 'Visitor'} shared relationship challenges.`,
      modelUsed: 'nivara-empathetic-engine'
    };
  }

  // 7. General Stress / Anxiety / Overwhelm
  if (count === 0) {
    return {
      success: true,
      reply: `I hear you${name ? ', ' + name : ''}. Thank you for trusting me with this.\n\nDoes it feel more like your thoughts won't slow down, or that you're carrying too many things at once?`,
      state: 'LISTENING',
      shouldSendEmail: false,
      shouldGenerateSolution: false,
      conversationSummary: `${name || 'Visitor'} shared feelings of stress and overwhelm.`,
      modelUsed: 'nivara-empathetic-engine'
    };
  }

  return {
    success: true,
    reply: `That makes complete sense. When everything feels urgent, nothing gets clarity.\n\nI think I understand what's really bothering you now.\n\nWould you like me to put together a practical plan based on what you've told me?`,
    state: 'LISTENING',
    shouldSendEmail: false,
    shouldGenerateSolution: false,
    conversationSummary: `${name || 'Visitor'} shared personal struggles.`,
    modelUsed: 'nivara-empathetic-engine'
  };
}

/**
 * Main server-side caller for Gemini Chat
 */
export async function callGeminiChat(
  payload: ChatRequestPayload,
  apiKey?: string
): Promise<ChatResponsePayload> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === '') {
    return generateEmpatheticFallback(payload, 'No GEMINI_API_KEY configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const user = payload.user || payload.userData || payload.userProfile || {};
  const stage = payload.stage || payload.conversationStage || 'LISTENING';
  const count = payload.explorationCount !== undefined ? payload.explorationCount : (payload.followUpCount || 0);
  const currentMsg = payload.message || payload.currentMessage || '';

  const stagePrompt = buildStagePrompt(stage, count, user, currentMsg);
  const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n${stagePrompt}`;

  // Build message history
  const contents: any[] = [];
  const rawHistory = payload.conversation || payload.history || payload.messages || [];

  if (Array.isArray(rawHistory) && rawHistory.length > 0) {
    for (const item of rawHistory) {
      const role =
        item.role === 'model' || item.role === 'assistant' || (item as any).sender === 'nivara'
          ? 'model'
          : 'user';
      const text = item.text || item.content || '';
      if (text && typeof text === 'string') {
        contents.push({
          role,
          parts: [{ text }]
        });
      }
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: currentMsg }]
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: fullSystemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: count >= 2 ? 1400 : 800,
          topP: 0.95,
          response_mime_type: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[Gemini API Warning] HTTP ${response.status}: ${errBody}`);
      return generateEmpatheticFallback(payload, `API status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText || typeof candidateText !== 'string') {
      return generateEmpatheticFallback(payload, 'Empty text returned');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        reply: candidateText.trim(),
        state: 'LISTENING',
        shouldSendEmail: false,
        shouldGenerateSolution: false
      };
    }

    const reply = parsed.reply || candidateText.trim();
    const isSol = isAskingForAdvice(currentMsg) || parsed.state === 'SOLUTION';

    let solutionPlan: StructuredSolutionPlan | undefined;
    if (isSol) {
      solutionPlan = extractSolutionPlan(reply, user);
    }

    return {
      success: true,
      reply,
      state: parsed.state || (isSol ? 'SOLUTION' : 'LISTENING'),
      intent: parsed.intent || 'support',
      shouldSendEmail: parsed.shouldSendEmail ?? false,
      shouldGenerateSolution: isSol,
      conversationSummary: parsed.conversationSummary || user.conversationSummary,
      solutionPlan,
      isSolution: isSol,
      modelUsed: model
    };
  } catch (err: any) {
    console.error('[Gemini Network Error]:', err?.message || err);
    return generateEmpatheticFallback(payload, err?.message || 'Network error');
  }
}
