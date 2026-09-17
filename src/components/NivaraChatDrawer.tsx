import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Mail,
  Paperclip,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  getCandidateEmail,
  setCandidateEmail
} from '../services/api';
import {
  sendChatMessage,
  notifyCandidate,
  SolutionPlan
} from '../services/chatService';
import { soundManager } from '../utils/audio';
import {
  processNivaraMessage,
  ConversationState,
  createInitialState,
  isValidEmail,
  INITIAL_INTRO_TEXT
} from '../utils/nivaraChatEngine';

interface Message {
  id: string;
  sender: 'nivara' | 'user';
  text: string;
  timestamp: string;
  solutionPlan?: SolutionPlan;
  isConfirmation?: boolean;
  referenceId?: string;
  candidateEmail?: string;
  subject?: string;
  submittedAt?: string;
  showEmailRetry?: boolean;
  emailNotificationStatus?: 'pending' | 'sent' | 'failed';
  previewUrl?: string;
  smtpDelivered?: boolean;
}

interface NivaraChatDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const getFormattedTime = (): string => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const INITIAL_GREETING: Message = {
  id: 'initial-greeting',
  sender: 'nivara',
  text: INITIAL_INTRO_TEXT,
  timestamp: getFormattedTime()
};

const STORAGE_MSGS_KEY = 'nivara_chat_msgs_v6';
const STORAGE_STATE_KEY = 'nivara_chat_state_v6';

export const NivaraChatDrawer: React.FC<NivaraChatDrawerProps> = ({ isOpen, onOpen, onClose }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [candidateEmailVal, setCandidateEmailVal] = useState(getCandidateEmail());
  const [savedAlert, setSavedAlert] = useState(false);
  const [showEmojiBubble, setShowEmojiBubble] = useState(true);

  // 1. Persistent Message History
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_MSGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [INITIAL_GREETING];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // 2. Persistent Structured Conversation State
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_STATE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.stage || parsed.conversationStage)) return parsed;
        }
      } catch {}
    }
    return createInitialState();
  });

  const [quickChips, setQuickChips] = useState<string[]>([]);
  const [lastSolutionMsgId, setLastSolutionMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Sync to session storage on state/messages updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(conversationState));
      } catch {}
    }
  }, [conversationState]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmojiBubble(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ─── ADD NIVARA MESSAGE ─────────────────────────────────────────────────
  const addNivaraMessage = useCallback((text: string, delay = 400, extra?: Partial<Message>): string => {
    const msgId = extra?.id || Math.random().toString(36).substring(2, 9);
    setIsTyping(true);
    setTimeout(() => {
      soundManager.playCrystalChime(950 + Math.random() * 200);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: 'nivara',
          text,
          timestamp: getFormattedTime(),
          ...extra
        }
      ]);
    }, delay);
    return msgId;
  }, []);

  // ─── AUTOMATIC CANDIDATE EMAIL NOTIFICATION VIA RESEND ──────────────────
  const triggerCandidateNotification = async (state: ConversationState, targetMsgId?: string) => {
    const profile = state.userProfile;
    const solId = targetMsgId || lastSolutionMsgId;

    if (solId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === solId ? { ...m, emailNotificationStatus: 'pending' } : m))
      );
    }

    try {
      const res = await notifyCandidate({
        name: profile.name || state.name || 'Friend',
        age: profile.age || state.age || undefined,
        location: profile.location || state.location || undefined,
        visitorEmail: profile.email || state.email || undefined,
        grievance: profile.grievance || state.grievance || state.problem || 'General help request',
        conversationSummary: profile.conversationSummary,
        requestId: state.requestId
      });

      if (res.success) {
        if (solId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === solId
                ? {
                    ...m,
                    emailNotificationStatus: 'sent',
                    referenceId: res.referenceId,
                    showEmailRetry: false
                  }
                : m
            )
          );
        }

        setConversationState((prev) => ({
          ...prev,
          emailStatus: 'SENT',
          currentStage: 'EMAIL_SENT',
          stage: 'EMAIL_SENT',
          conversationStage: 'EMAIL_SENT',
          emailNotificationStatus: 'sent',
          requestSubmitted: true,
          emailNotificationSentAt: new Date().toISOString()
        }));
      } else {
        throw new Error(res.message || 'Notification failed');
      }
    } catch (err: any) {
      console.warn('[Candidate Notification Error]:', err);

      if (solId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === solId
              ? {
                  ...m,
                  emailNotificationStatus: 'failed',
                  showEmailRetry: true
                }
              : m
          )
        );
      }

      setConversationState((prev) => ({
        ...prev,
        emailStatus: 'FAILED',
        currentStage: 'EMAIL_FAILED',
        stage: 'EMAIL_FAILED',
        conversationStage: 'EMAIL_FAILED',
        emailNotificationStatus: 'failed'
      }));

      // Non-intrusive safe failure communication
      addNivaraMessage(
        "Your request couldn't be sent just now, but your conversation is still safe.",
        400
      );
    }
  };

  // ─── MANUAL SEND REQUEST (Section 9, 11 & 12) ──────────────────────────
  const handleManualSendRequest = async () => {
    if (isSendingRequest || conversationState.requestSubmitted) return;
    setIsSendingRequest(true);
    soundManager.playCrystalChime(880);

    const pendingMsgId = addNivaraMessage("Sending your request...", 200, {
      emailNotificationStatus: 'pending',
      referenceId: conversationState.requestId
    });

    try {
      const profile = conversationState.userProfile;
      const res = await notifyCandidate({
        name: profile.name || conversationState.name || 'Friend',
        age: profile.age || conversationState.age || undefined,
        location: profile.location || conversationState.location || undefined,
        visitorEmail: profile.email || conversationState.email || undefined,
        grievance: profile.grievance || conversationState.grievance || conversationState.problem || 'General help request',
        conversationSummary: profile.conversationSummary,
        nivaraResponse: conversationState.solution || conversationState.solutionText,
        suggestedNextStep: conversationState.solutionPlan?.nextStep || conversationState.solutionPlan?.firstStep,
        requestId: conversationState.requestId
      });

      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingMsgId
              ? {
                  ...m,
                  text: "Your request has been sent.\nI've kept what you shared safe here too.\nYou can come back whenever you need.",
                  emailNotificationStatus: 'sent',
                  referenceId: res.referenceId || conversationState.requestId,
                  showEmailRetry: false
                }
              : m
          )
        );

        setConversationState((prev) => ({
          ...prev,
          requestSubmitted: true,
          emailStatus: 'SENT',
          emailNotificationStatus: 'sent',
          emailNotificationSentAt: new Date().toISOString()
        }));
      } else {
        throw new Error(res.message || 'Notification failed');
      }
    } catch (err: any) {
      console.warn('[Manual Send Request Error]:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingMsgId
            ? {
                ...m,
                text: "Something interrupted the delivery.\nYour conversation is still safe here.",
                emailNotificationStatus: 'failed',
                showEmailRetry: true
              }
            : m
        )
      );

      setConversationState((prev) => ({
        ...prev,
        emailStatus: 'FAILED',
        emailNotificationStatus: 'failed'
      }));
    } finally {
      setIsSendingRequest(false);
    }
  };

  // ─── MAIN SEND HANDLER ──────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const raw = overrideText !== undefined ? overrideText : inputVal;
    const trimmed = raw.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    soundManager.playCrystalChime(750);

    // 1. Append user message to state and history
    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: trimmed,
      timestamp: getFormattedTime()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // 2. Process message through state machine
    const result = processNivaraMessage(trimmed, conversationState);
    const newState = result.updatedState;

    setConversationState(newState);
    setQuickChips(result.quickChips || []);

    // If visitor email provided, sync to candidate email settings store
    if (newState.userProfile.email && isValidEmail(newState.userProfile.email)) {
      setCandidateEmail(newState.userProfile.email);
      setCandidateEmailVal(newState.userProfile.email);
    }

    // 3. If grievance completion signaled by deterministic engine, display response and enable Send Request CTA (NO auto-send)
    if (result.shouldSendEmail || result.shouldNotifyCandidate || newState.currentStage === 'GRIEVANCE_COMPLETE') {
      const msgId = addNivaraMessage(result.replyText, 350, {
        referenceId: newState.requestId
      });
      setLastSolutionMsgId(msgId);
      setConversationState((prev) => ({
        ...prev,
        ...newState,
        canSendRequest: true,
        solutionReady: true
      }));
      setIsSending(false);
      return;
    }

    // 4. If Gemini should be called (problem listening & exploration follow-ups)
    if (result.shouldCallGemini) {
      setIsTyping(true);
      try {
        const allMessages = [...messages, userMsg];
        const historyPayload = allMessages.map((m) => ({
          role: (m.sender === 'nivara' ? 'model' : 'user') as 'model' | 'user',
          text: m.text,
          content: m.text
        }));

        const geminiRes = await sendChatMessage({
          message: trimmed,
          history: historyPayload,
          userProfile: newState.userProfile,
          situation: newState.userProfile.grievance || trimmed,
          context: newState.userProfile.conversationSummary,
          stage: newState.stage,
          conversationStage: newState.stage,
          explorationCount: newState.explorationCount,
          action: 'chat'
        });

        setIsTyping(false);
        soundManager.playCrystalChime(950);

        if (geminiRes.success && geminiRes.reply) {
          const isSolution = geminiRes.isSolution || geminiRes.shouldGenerateSolution || false;
          const solutionMsgId = Math.random().toString(36).substring(2, 9);

          addNivaraMessage(geminiRes.reply, 300, {
            id: solutionMsgId,
            solutionPlan: geminiRes.solutionPlan,
            referenceId: newState.requestId
          });

          if (isSolution) {
            setLastSolutionMsgId(solutionMsgId);
            const resolvedState: ConversationState = {
              ...newState,
              stage: 'GRIEVANCE_COMPLETE',
              conversationStage: 'GRIEVANCE_COMPLETE',
              solution: geminiRes.reply,
              solutionText: geminiRes.reply,
              solutionPlan: geminiRes.solutionPlan,
              solutionReady: true,
              canSendRequest: true
            };
            setConversationState(resolvedState);
            setQuickChips(['Thank you, Nivara', 'I have another thought']);
            // Explicit Send Request action is shown via the CTA card; no automatic background dispatch
          }
        } else {
          addNivaraMessage(
            "I lost the thread for a moment, but I'm still here. Try sending that again.",
            300
          );
        }
      } catch {
        setIsTyping(false);
        addNivaraMessage(
          "I lost the thread for a moment, but I'm still here. Try sending that again.",
          300
        );
      }
      setIsSending(false);
      return;
    }

    // 5. Default demographic state machine responses
    if (result.replyText) {
      addNivaraMessage(result.replyText, 350);
    }
    setIsSending(false);
  };

  // ─── RETRY EMAIL DISPATCH ───────────────────────────────────────────────
  const handleRetryEmail = async () => {
    soundManager.playCrystalChime(850);
    await handleManualSendRequest();
  };

  // ─── CHAT RESET (ONLY TRIGGERED ON EXPLICIT BUTTON CLICK) ───────────────
  const handleReset = () => {
    soundManager.playCrystalChime(600);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_MSGS_KEY);
        sessionStorage.removeItem(STORAGE_STATE_KEY);
      } catch {}
    }
    setConversationState(createInitialState());
    setQuickChips([]);
    setLastSolutionMsgId(null);
    setMessages([
      {
        ...INITIAL_GREETING,
        timestamp: getFormattedTime()
      }
    ]);
  };

  // ─── DYNAMIC INPUT PLACEHOLDER ──────────────────────────────────────────
  const getPlaceholder = () => {
    const stage = String(conversationState.currentStage || conversationState.stage || conversationState.conversationStage || '');
    switch (stage) {
      case 'GREETING':
      case 'WAITING_FOR_NAME':
      case 'COLLECT_NAME':
        return 'What should I call you?...';
      case 'WAITING_FOR_AGE':
      case 'COLLECT_AGE':
        return 'Your age...';
      case 'WAITING_FOR_LOCATION':
      case 'COLLECT_LOCATION':
        return 'Which city or place are you from?...';
      case 'WAITING_FOR_EMAIL':
      case 'COLLECT_EMAIL':
        return 'Enter your email address...';
      case 'READY_FOR_GRIEVANCE':
      case 'LISTENING':
      case 'FOLLOW_UP':
        return "Tell Nivara what's on your mind...";
      case 'GRIEVANCE_COMPLETE':
      case 'EMAIL_PENDING':
      case 'EMAIL_SENT':
      case 'EMAIL_FAILED':
      case 'READY_TO_HELP':
      case 'SOLUTION':
        return "I'm right here with you...";
      default:
        return 'Type your response...';
    }
  };

  return (
    <>
      {/* 1. FLOATING NIVARA EMOJI WITH "I AM HERE" POP-UP SPEECH BUBBLE */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 25 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 select-none"
          >
            {/* "I am here" Pop-Up Speech Bubble */}
            <AnimatePresence>
              {showEmojiBubble && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    soundManager.playCrystalChime(850);
                    onOpen();
                  }}
                  className="group relative cursor-pointer"
                  title="Click to speak with Nivara"
                >
                  <div className="relative px-4 py-2 rounded-2xl bg-black/95 text-white border border-white/30 shadow-[0_12px_35px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-xl flex items-center gap-2 transition-all">
                    <span className="text-sm">❄️</span>
                    <span className="font-cinzel text-xs font-bold tracking-wider text-white">
                      "I am here."
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>

                  {/* Speech Bubble Pointer Tail */}
                  <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-black/95 border-r border-b border-white/30 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular Nivara Emoji Avatar Trigger */}
            <button
              onClick={() => {
                soundManager.playCrystalChime(850);
                onOpen();
              }}
              className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black border-2 border-white/40 hover:border-white shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Talk with Nivara"
            >
              <span className="absolute -inset-1 rounded-full bg-white/10 blur-md group-hover:bg-white/25 transition-all animate-pulse" />

              <div className="relative w-full h-full rounded-full overflow-hidden">
                <img
                  src="/assets/nivara_sanctuary_reference.jpg"
                  alt="Nivara Emoji"
                  className="w-full h-full object-cover object-[42%_25%] grayscale-[20%] contrast-[110%]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/story/06_her_purpose.png';
                  }}
                />
              </div>

              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-black shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CHAT INTERFACE - CINEMATIC BLACK & WHITE COMPANION DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Soft backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity"
            />

            {/* Floating Card */}
            <motion.aside
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-3 bottom-3 right-3 sm:top-5 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-1.5rem)] sm:w-[390px] lg:w-[26vw] xl:w-[26vw] min-w-[330px] max-w-[460px] bg-black/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.98),0_0_30px_rgba(255,255,255,0.08)] flex flex-col overflow-hidden text-neutral-100"
            >
              <div className="absolute top-0 right-0 left-0 h-28 bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none" />

              {/* HEADER */}
              <div className="relative z-10 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-white/15 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0">
                    <img
                      src="/assets/nivara_sanctuary_reference.jpg"
                      alt="Nivara Sovereign Avatar"
                      className="w-full h-full object-cover object-[42%_25%] grayscale-[30%]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/story/06_her_purpose.png';
                      }}
                    />
                  </div>

                  <div>
                    <h3 className="font-cinzel text-sm font-bold tracking-[0.25em] text-white">NIVARA</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-sans">
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
                      <span>Online · Always listening</span>
                    </div>
                  </div>
                </div>

                {/* Right Header: Sound Wave Equalizer + Controls */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex items-center gap-[2.5px] h-5 px-1.5 shrink-0"
                    title="Nivara listening frequency"
                  >
                    {[8, 16, 12, 22, 10, 18, 14, 20, 8].map((maxH, i) => (
                      <motion.span
                        key={i}
                        className="w-[2px] bg-white rounded-full"
                        animate={{
                          height: isTyping ? [4, maxH, 6, maxH * 0.8, 4] : [4, maxH * 0.5, 4]
                        }}
                        transition={{
                          duration: 0.9 + (i % 3) * 0.2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    title="Preservation Email Settings"
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isSettingsOpen
                        ? 'text-white bg-white/20'
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleReset}
                    title="Start New Conversation"
                    className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onClose}
                    title="Close Chat"
                    className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SETTINGS PANEL */}
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative z-10 bg-neutral-950 border-b border-white/15 px-4 py-2.5 text-xs overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-cinzel text-[10px] text-white font-bold tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        PRESERVATION EMAIL
                      </span>
                      {savedAlert && <span className="text-[10px] text-neutral-300 font-mono">✓ Saved</span>}
                    </div>
                    <p className="text-[10px] text-neutral-400 mb-1.5">
                      Nivara dispatches superhero help notifications automatically upon your request.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={candidateEmailVal}
                        onChange={(e) => setCandidateEmailVal(e.target.value)}
                        placeholder="your.email@example.com"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/20 text-white text-[11px] font-mono focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCandidateEmail(candidateEmailVal);
                          setSavedAlert(true);
                          setTimeout(() => setSavedAlert(false), 2000);
                        }}
                        className="px-3 py-1 rounded-lg bg-white text-black font-cinzel text-[10px] font-bold hover:bg-neutral-200 transition-all cursor-pointer"
                      >
                        SAVE
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CHAT STREAM */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((m) => {
                  const isNivara = m.sender === 'nivara';
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isNivara ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[94%] ${isNivara ? '' : 'flex-row-reverse'}`}>
                        {isNivara && (
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 shrink-0 mt-0.5 shadow-sm">
                            <img
                              src="/assets/nivara_sanctuary_reference.jpg"
                              alt="Nivara"
                              className="w-full h-full object-cover object-[42%_25%] grayscale-[30%]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/story/06_her_purpose.png';
                              }}
                            />
                          </div>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-md ${
                            isNivara
                              ? 'bg-neutral-900/95 border border-white/15 text-neutral-100 font-sans rounded-tl-sm'
                              : 'bg-white text-black font-medium font-sans rounded-tr-sm shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>

                          {/* ─── STRUCTURED PERSONALIZED SOLUTION PLAN ─── */}
                          {m.solutionPlan && (
                            <div className="mt-3 pt-3 border-t border-white/15 space-y-2.5 text-left font-sans">
                              <div className="flex items-center justify-between">
                                <span className="font-cinzel text-[11px] font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                  {m.solutionPlan.title || "NIVARA'S PATH FORWARD"}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-400 italic">"I heard you."</span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs">
                                <p className="text-[10px] font-cinzel uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Problem:</p>
                                <p className="text-white font-medium">{m.solutionPlan.problem}</p>
                              </div>

                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                                <p className="text-[10px] font-cinzel uppercase tracking-wider text-cyan-400 font-semibold mb-0.5">What I understand:</p>
                                <p className="text-neutral-200">{m.solutionPlan.understood}</p>
                              </div>

                              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-400/30 text-xs">
                                <p className="text-[10px] font-cinzel uppercase tracking-wider text-cyan-300 font-semibold mb-0.5">Your next step:</p>
                                <p className="text-white font-medium">{m.solutionPlan.nextStep}</p>
                              </div>

                              {m.solutionPlan.actionSteps && m.solutionPlan.actionSteps.length > 0 && (
                                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs">
                                  <p className="text-[10px] font-cinzel uppercase tracking-wider text-neutral-400 font-semibold mb-1.5">Action Plan:</p>
                                  <ul className="space-y-1">
                                    {m.solutionPlan.actionSteps.map((step: string, sIdx: number) => (
                                      <li key={sIdx} className="flex items-start gap-2 text-neutral-200 text-[11px]">
                                        <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[9px] font-mono shrink-0 mt-0.5">{sIdx + 1}</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {m.solutionPlan.firstStep && (
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/20 text-xs">
                                  <p className="text-[10px] font-cinzel uppercase tracking-wider text-neutral-300 font-semibold mb-0.5">First step today:</p>
                                  <p className="text-white font-medium">{m.solutionPlan.firstStep}</p>
                                </div>
                              )}

                              <div className="pt-2 text-center border-t border-white/10">
                                <p className="text-xs italic text-cyan-200 font-serif leading-relaxed">
                                  "You don't have to solve everything at once. Just find the next step."
                                </p>
                                <p className="text-[10px] font-cinzel font-bold text-neutral-400 mt-1 uppercase tracking-widest">— Nivara</p>
                              </div>
                            </div>
                          )}

                          {/* ─── AUTOMATIC NOTIFICATION BADGE ─── */}
                          {m.emailNotificationStatus === 'pending' && (
                            <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2 text-xs text-neutral-400 font-sans">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-cyan-300" />
                              </motion.span>
                              <span className="text-[11px] text-neutral-300">Sending Nivara's help request notification...</span>
                            </div>
                          )}

                          {m.emailNotificationStatus === 'sent' && (
                            <div className="mt-2.5 pt-2 border-t border-white/15 flex flex-col gap-1 text-xs font-sans">
                              <div className="flex items-center gap-1.5 text-cyan-300 font-cinzel text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>Your request has been safely sent to Nivara's team.</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                Reference: {m.referenceId || conversationState.requestId}
                              </span>
                            </div>
                          )}

                          {/* ─── RETRY NOTIFICATION BUTTON (SAFE FAILURE RESILIENCE) ─── */}
                          {m.showEmailRetry && m.emailNotificationStatus === 'failed' && (
                            <div className="mt-2.5 pt-2 border-t border-white/15 flex flex-col gap-1.5 text-xs font-sans">
                              <p className="text-[11px] text-amber-300/90 font-sans">
                                Something interrupted the delivery. Your conversation is still safe here.
                              </p>
                              <button
                                type="button"
                                onClick={handleRetryEmail}
                                disabled={isSending || isSendingRequest}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-200 hover:bg-white/20 hover:text-white font-cinzel text-[10px] tracking-wider transition-all cursor-pointer w-fit disabled:opacity-50"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Retry Sending
                              </button>
                            </div>
                          )}

                          {/* Cryo Vault Confirmation Badge */}
                          {m.isConfirmation && m.referenceId && (
                            <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                              <div className="flex items-center gap-1.5 text-white font-cinzel text-[11px] font-bold tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                <span>RECORDED IN CRYO-VAULT</span>
                              </div>
                              <div className="text-[10px] font-mono text-neutral-300 space-y-0.5">
                                <p>
                                  REFERENCE ID: <span className="text-white font-bold">{m.referenceId}</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                        {m.timestamp}
                      </span>
                    </motion.div>
                  );
                })}

                {/* Minimal Animated Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 text-neutral-300 text-xs italic px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-2xl w-fit backdrop-blur-md shadow-md"
                  >
                    <span className="flex items-center gap-1">
                      <motion.span
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]"
                      />
                      <motion.span
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2, ease: 'easeInOut' }}
                        className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                      />
                      <motion.span
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]"
                      />
                    </span>
                    <span className="font-sans text-[11px] tracking-wide text-neutral-300">
                      Nivara is listening...
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ─── EXPLICIT HERO ACTION: SEND REQUEST (Section 9 & 12) ─── */}
              {conversationState.canSendRequest && (
                <div className="px-3.5 py-2.5 border-t border-white/15 bg-gradient-to-r from-cyan-950/40 via-neutral-900/80 to-black backdrop-blur-md flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                    </div>
                    <p className="text-[11px] text-neutral-200 leading-snug font-sans">
                      {conversationState.requestSubmitted
                        ? "Your request has been sent. I've kept what you shared safe here too. You can come back whenever you need."
                        : conversationState.emailStatus === 'FAILED'
                        ? "Something interrupted the delivery. Your conversation is still safe here."
                        : "I've put together something based on what you shared. Would you like me to send this request to your email so you can return to it later?"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {conversationState.requestSubmitted
                        ? `Ref: ${conversationState.requestId}`
                        : conversationState.emailStatus === 'FAILED'
                        ? 'Status: interrupted'
                        : 'Official Sentinel Dispatch'}
                    </span>

                    {conversationState.emailStatus === 'FAILED' ? (
                      <button
                        type="button"
                        onClick={handleManualSendRequest}
                        disabled={isSendingRequest || isSending}
                        className="px-3.5 py-1.5 rounded-full font-cinzel text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSendingRequest ? 'animate-spin' : ''}`} />
                        <span>{isSendingRequest ? 'Sending your request...' : 'Retry Sending'}</span>
                      </button>
                    ) : conversationState.requestSubmitted ? (
                      <div className="px-3 py-1 rounded-full font-cinzel text-[10px] font-bold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-cyan-300" />
                        <span>✓ REQUEST SENT</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleManualSendRequest}
                        disabled={isSendingRequest || isSending || isTyping}
                        className="px-3.5 py-1.5 rounded-full font-cinzel text-[10px] font-bold tracking-wider bg-white text-black hover:bg-neutral-200 border border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSendingRequest ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Sending your request...</span>
                          </>
                        ) : (
                          <>
                            <span>✦ SEND REQUEST</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* QUICK SUGGESTION PILLS */}
              {quickChips && quickChips.length > 0 && (
                <div className="px-3.5 py-2 flex flex-wrap gap-1.5 border-t border-white/10 bg-white/[0.01]">
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSend(undefined, chip)}
                      disabled={isSending || isTyping}
                      className="px-3 py-1 rounded-full bg-neutral-900 border border-white/20 text-[11px] text-neutral-200 font-sans hover:bg-white hover:text-black transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* BOTTOM INPUT CAPSULE */}
              <div className="p-3 sm:p-3.5 border-t border-white/15 bg-black">
                <form
                  onSubmit={(e) => handleSend(e)}
                  className="relative flex items-center rounded-full bg-neutral-950 border border-white/25 p-1 pl-3.5 focus-within:border-white focus-within:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => soundManager.playCrystalChime(900)}
                    title="Attach thought or memory"
                    className="text-neutral-400 hover:text-white transition-colors mr-1.5 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 -rotate-45" />
                  </button>

                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={getPlaceholder()}
                    disabled={isSending || isTyping}
                    className="flex-1 bg-transparent text-white placeholder-neutral-500 text-xs font-sans focus:outline-none pr-2 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isSending || isTyping}
                    className="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 disabled:opacity-30 disabled:hover:scale-100 text-black flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>

                <div className="mt-2 text-center">
                  <p className="text-[8px] sm:text-[9px] font-cinzel text-neutral-400 tracking-[0.25em] uppercase">
                    EVERY STORY LEAVES A TRACE. AND HERE, IT MATTERS.
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NivaraChatDrawer;
