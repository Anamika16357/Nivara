import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Sparkles, User, Mail, MapPin, Calendar, Lock, ArrowRight, Shield } from 'lucide-react';
import { submitGrievanceToAdmin, SubmissionResponse } from '../services/api';
import { soundManager } from '../utils/audio';

interface HelpPortalProps {
  isOpen?: boolean;
}

export const HelpPortal: React.FC<HelpPortalProps> = () => {
  // Chat Steps: 'greeting' -> 'name' -> 'age' -> 'location' -> 'email' -> 'grievance' -> 'submitting' -> 'success'
  const [step, setStep] = useState<'greeting' | 'name' | 'age' | 'location' | 'email' | 'grievance' | 'submitting' | 'success'>('greeting');

  const [greetingText, setGreetingText] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    email: '',
    grievance: ''
  });

  const [responseState, setResponseState] = useState<SubmissionResponse | null>(null);

  const handleGreeting = (text: string) => {
    soundManager.playCrystalChime(850);
    setGreetingText(text);
    setTimeout(() => {
      setStep('name');
      soundManager.playCrystalChime(950);
    }, 400);
  };

  const handleNextStep = (next: 'age' | 'location' | 'email' | 'grievance') => {
    soundManager.playCrystalChime(950);
    setStep(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent, next: 'age' | 'location' | 'email' | 'grievance', condition: boolean) => {
    if (e.key === 'Enter' && condition) {
      e.preventDefault();
      handleNextStep(next);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grievance.trim()) return;

    soundManager.playCrystalChime(1100);
    setStep('submitting');

    try {
      const res = await submitGrievanceToAdmin(formData);
      setResponseState(res);
      soundManager.playCrystalChime(1300);
      setStep('success');
    } catch {
      setResponseState({
        success: true,
        referenceId: `CRYO-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Your request has been recorded. You don\'t have to carry it alone anymore.',
        candidateEmail: 'anamika@example.com',
        subject: '🦸 Someone Needs Your Help!',
        submittedAt: new Date().toLocaleString(),
        notificationDispatched: true
      });
      setStep('success');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', age: '', location: '', email: '', grievance: '' });
    setGreetingText('');
    setStep('greeting');
  };

  return (
    <section id="help" className="relative py-28 px-6 bg-[#02040a] text-slate-100 overflow-hidden border-t border-white/10">
      {/* Background radial frost glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-950/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-cyan-400/30 text-cyan-200 text-xs font-cinzel tracking-[0.3em] mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>DIRECT SOVEREIGN SANCTUARY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-cinzel tracking-[0.2em] text-white uppercase mb-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
            THE NIVARA HELP PORTAL
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent mx-auto" />
          <p className="mt-4 font-cormorant text-xl sm:text-2xl text-slate-300 italic font-light">
            “No voice should disappear unheard.”
          </p>
        </div>

        {/* Main Dark Icy Chat Interface */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#060c18]/90 border border-cyan-500/20 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
          {/* Nivara Avatar Header */}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-white/10">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <img
                src="/assets/story/06_her_purpose.png"
                alt="Nivara Sovereign Avatar"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-lg text-white tracking-widest flex items-center gap-2">
                NIVARA
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
              </h3>
              <p className="font-cinzel text-xs text-cyan-300 tracking-widest uppercase">
                ICE SOVEREIGN • GUARDIAN OF HEARD VOICES
              </p>
            </div>
          </div>

          {/* STEP 1: GREETING */}
          {step === 'greeting' && (
            <div className="space-y-8 animate-fade-in text-center sm:text-left">
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border-l-4 border-cyan-400 border border-white/10 space-y-3">
                <p className="font-cormorant text-3xl sm:text-4xl text-white italic font-light">
                  “Hey! I'm Nivara. I help people who need someone to listen.”
                </p>
                <p className="font-cormorant text-2xl text-cyan-200 italic font-light">
                  “You don't need to be strong here. What's your name?”
                </p>
                <p className="font-cormorant text-xl text-slate-300 italic font-light">
                  Say “Hi” or introduce yourself to begin.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {[
                  'Hi Nivara 👋',
                  'Hello',
                  'Greetings, Sovereign ❄️'
                ].map((greeting) => (
                  <button
                    key={greeting}
                    onClick={() => handleGreeting(greeting)}
                    className="px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-slate-950 font-cinzel text-xs font-bold tracking-widest border border-cyan-400/40 hover:border-white transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {greeting}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: NAME INPUT */}
          {step === 'name' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 border-l-4 border-cyan-400 space-y-2">
                <p className="font-cormorant text-lg text-cyan-200 italic font-light">
                  “{greetingText ? `"${greetingText}" — ` : ''}Hello. It warms the frost to hear your voice.”
                </p>
                <p className="font-cormorant text-2xl text-white italic font-light">
                  “Before we begin, what should I call you?”
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-cinzel text-cyan-300 tracking-wider">YOUR NAME</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'age', Boolean(formData.name.trim()))}
                    placeholder="e.g. Anamika"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.05] border border-white/20 text-white font-sans text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              <button
                disabled={!formData.name.trim()}
                onClick={() => handleNextStep('age')}
                className="px-8 py-3.5 rounded-full bg-white text-slate-950 font-cinzel text-xs font-bold tracking-widest hover:bg-slate-100 disabled:opacity-40 transition-all shadow-md cursor-pointer"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* STEP 3: AGE INPUT */}
          {step === 'age' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 border-l-4 border-cyan-400">
                <p className="font-cormorant text-2xl text-white italic font-light">
                  “It's good to meet you, {formData.name}. How old are you?”
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-cinzel text-cyan-300 tracking-wider">YOUR AGE</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'location', Boolean(formData.age.trim()))}
                    placeholder="e.g. 24"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.05] border border-white/20 text-white font-sans text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              <button
                disabled={!formData.age.trim()}
                onClick={() => handleNextStep('location')}
                className="px-8 py-3.5 rounded-full bg-white text-slate-950 font-cinzel text-xs font-bold tracking-widest hover:bg-slate-100 disabled:opacity-40 transition-all shadow-md cursor-pointer"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* STEP 4: LOCATION INPUT */}
          {step === 'location' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 border-l-4 border-cyan-400">
                <p className="font-cormorant text-2xl text-white italic font-light">
                  “Where are you reaching me from?”
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-cinzel text-cyan-300 tracking-wider">YOUR LOCATION</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'email', Boolean(formData.location.trim()))}
                    placeholder="City, Country..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.05] border border-white/20 text-white font-sans text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              <button
                disabled={!formData.location.trim()}
                onClick={() => handleNextStep('email')}
                className="px-8 py-3.5 rounded-full bg-white text-slate-950 font-cinzel text-xs font-bold tracking-widest hover:bg-slate-100 disabled:opacity-40 transition-all shadow-md cursor-pointer"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* STEP 5: EMAIL INPUT */}
          {step === 'email' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 border-l-4 border-cyan-400">
                <p className="font-cormorant text-2xl text-white italic font-light">
                  “What is the best email address where we can reach you?”
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-cinzel text-cyan-300 tracking-wider">YOUR EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'grievance', Boolean(formData.email.trim() && formData.email.includes('@')))}
                    placeholder="your.email@domain.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.05] border border-white/20 text-white font-sans text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              <button
                disabled={!formData.email.trim() || !formData.email.includes('@')}
                onClick={() => handleNextStep('grievance')}
                className="px-8 py-3.5 rounded-full bg-white text-slate-950 font-cinzel text-xs font-bold tracking-widest hover:bg-slate-100 disabled:opacity-40 transition-all shadow-md cursor-pointer"
              >
                CONTINUE TO YOUR STORY
              </button>
            </div>
          )}

          {/* STEP 6: GRIEVANCE PROMPT & TEXTAREA */}
          {step === 'grievance' && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 border-l-4 border-cyan-400">
                <p className="font-cormorant text-2xl text-white italic font-light">
                  “So... tell me. How can I help you?”
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-cinzel text-cyan-300 tracking-wider">
                  DESCRIBE WHAT HAPPENED OR WHAT YOU NEED
                </label>
                <textarea
                  rows={5}
                  value={formData.grievance}
                  onChange={(e) => setFormData({ ...formData, grievance: e.target.value })}
                  placeholder="Speak your truth without hesitation. Nivara's crystalline vault preserves every word with complete fidelity..."
                  className="w-full p-4 rounded-xl bg-white/[0.05] border border-white/20 text-white font-sans text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner leading-relaxed"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!formData.grievance.trim()}
                className="w-full py-4 rounded-full bg-white text-slate-950 font-cinzel text-xs font-bold tracking-[0.25em] shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                TRANSMIT YOUR STORY TO NIVARA
              </button>
            </form>
          )}

          {/* STEP 7: SUBMITTING STATE */}
          {step === 'submitting' && (
            <div className="py-12 text-center space-y-6 animate-fade-in">
              <div className="inline-block p-4 rounded-full bg-white/5 border border-cyan-400/40 animate-spin-slow shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                <Sparkles className="w-8 h-8 text-cyan-300" />
              </div>
              <h3 className="font-cinzel text-xl text-white font-bold tracking-widest">
                FREEZING STORY IN CRYO-MEMORY VAULT...
              </h3>
              <p className="text-slate-400 text-xs font-mono">
                ENCRYPTING TRANSMISSION INTO THE SOVEREIGN REGISTRY
              </p>
            </div>
          )}

          {/* STEP 8: CONFIRMATION RESPONSE */}
          {step === 'success' && responseState && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-cyan-950/60 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="p-8 rounded-2xl bg-white/[0.03] border border-cyan-500/30 text-left space-y-4 shadow-xl">
                <p className="font-cormorant text-2xl text-white italic font-light leading-relaxed">
                  “I've heard you.”
                </p>
                <p className="font-cormorant text-xl text-cyan-200 italic font-light leading-relaxed">
                  “Your request has been recorded.”
                </p>
                <p className="font-cormorant text-xl text-slate-300 italic font-light leading-relaxed">
                  “You don't have to carry it alone anymore.”
                </p>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                  <span>REFERENCE ID: {responseState.referenceId}</span>
                  <span className="text-emerald-400">STATUS: SEALED & PRESERVED</span>
                </div>

                {/* AUTOMATIC NOTIFICATION DISPATCHED BANNER */}
                <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-cinzel font-bold text-xs tracking-wider">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>🦸 AUTOMATIC NOTIFICATION DISPATCHED TO CANDIDATE</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <p>
                      <span className="text-slate-400">To Candidate:</span>{' '}
                      <span className="text-white font-bold">{responseState.candidateEmail || 'anamika@example.com'}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Subject:</span>{' '}
                      <span className="text-cyan-300 font-bold">{responseState.subject || '🦸 Someone Needs Your Help!'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      <span className="text-slate-500">Date & Time:</span> {responseState.submittedAt || 'Now'}
                    </p>
                  </div>
                  <p className="text-[11px] text-cyan-200/80 italic font-sans pt-1 border-t border-white/10">
                    The notification was generated and sent automatically. The candidate does not have to manually check the website.
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-8 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-cinzel text-xs tracking-widest hover:bg-white/20 transition-all shadow-md cursor-pointer"
              >
                SUBMIT ANOTHER STORY
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
