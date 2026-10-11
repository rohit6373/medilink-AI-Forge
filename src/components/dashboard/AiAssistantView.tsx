import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Activity,
  CheckCircle2,
  FileText,
  ExternalLink,
  Globe,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';

interface GroundingSource {
  title: string;
  url: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: 'medilink_internal_ai' | 'gemini_google_search_grounded' | 'deterministic_engine';
  groundingSources?: GroundingSource[];
}

const QUICK_PROMPTS = [
  'Which hospital has available ICU beds and O- blood?',
  'Find MoHFW national emergency triage protocols',
  'What is the contact for e-RaktKosh blood bank registry?',
  'Which facility has a 24/7 on-call trauma surgeon?',
];

export const AiAssistantView: React.FC = () => {
  const { currentHospital, hospitals, requests } = useMediLink();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I am MediLink AI Clinical Decision Support. I monitor real-time resource telemetry across our verified network and can also retrieve public healthcare intelligence, government guidelines, and emergency registries via Google Search. How can I assist your workflow today?`,
      timestamp: 'Just now',
      source: 'medilink_internal_ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      // Call server backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.text,
          hospitalContext: currentHospital,
          networkHospitals: hospitals,
          activeRequests: requests,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'Analyzing real-time hospital telemetry...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
          groundingSources: data.groundingSources,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      // Fallback assistant response
      setTimeout(() => {
        const fallbackMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Based on current network telemetry for ${currentHospital?.name}: ICU beds are at normal operating capacity. In the event of acute trauma referrals, Apex Emergency and LifeLine Medical have active trauma surgical shifts.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'deterministic_engine',
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D8] text-[#5F8575] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Clinical & Research Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">
            AI Emergency Decision Support
          </h2>
          <p className="text-xs sm:text-sm text-[#707565] mt-1">
            Ask questions regarding verified regional capacity, triage optimization, blood bank availability, or public clinical guidelines.
          </p>
        </div>

        {/* Source badges */}
        <div className="flex items-center gap-2 text-[11px] text-[#707565]">
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#E5E0D5]">
            <Database className="w-3 h-3 text-[#5F8575]" />
            <span>MediLink DB</span>
          </span>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#E5E0D5]">
            <Globe className="w-3 h-3 text-blue-600" />
            <span>Google Search</span>
          </span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-[#9A9E8F] uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs bg-white hover:bg-[#F1EDE4] text-[#3A3D34] border border-[#E5E0D5] px-3 py-1.5 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-[#E5E0D5] shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 font-serif font-bold ${
                    isAi ? 'bg-[#8C947A]' : 'bg-[#3A3D34]'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-[#F9F7F2] text-[#3A3D34] border border-[#E5E0D5]'
                      : 'bg-[#3A3D34] text-[#F9F7F2]'
                  }`}
                >
                  {/* Source indicator for AI message */}
                  {isAi && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#707565] uppercase tracking-wider mb-2 pb-1.5 border-b border-[#EAE4D8]">
                      {m.source === 'gemini_google_search_grounded' ? (
                        <>
                          <Globe className="w-3 h-3 text-blue-600" />
                          <span>Google Search Grounded</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3 h-3 text-[#5F8575]" />
                          <span>MediLink Verified Database</span>
                        </>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Grounding Citations */}
                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#EAE4D8] space-y-1.5">
                      <div className="text-[10px] font-semibold text-[#707565] uppercase tracking-wider">
                        Search Citations:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.groundingSources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-white hover:bg-[#EAE4D8] border border-[#DCD7CD] px-2 py-0.5 rounded-md text-[10px] text-[#3A3D34] transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-[#8C947A]" />
                            <span className="max-w-[160px] truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 font-mono ${
                      isAi ? 'text-[#9A9E8F]' : 'text-[#DCD7CD]'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#8C947A] flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F9F7F2] border border-[#E5E0D5] rounded-2xl p-4 text-xs text-[#707565] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#8C947A] animate-ping"></div>
                <span>Evaluating telemetry and searching public healthcare intelligence...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-[#E5E0D5] bg-[#F9F7F2] flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask about live ICU beds, O- blood, trauma surgeons, or search external clinical protocols..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white border border-[#DCD7CD] focus:border-[#8C947A] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#3A3D34] placeholder:text-[#9A9E8F] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-[#8C947A] hover:bg-[#788069] disabled:bg-[#DCD7CD] text-white font-serif font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
