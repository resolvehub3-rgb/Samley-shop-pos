import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface ChatLink {
  label: string;
  route: string;
  domain?: 'marketing' | 'app';
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  links?: ChatLink[];
}

interface SamleyAIAssistantProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'intro-1',
  sender: 'ai',
  text: "Hello! 👋 I'm SamleyAI, your Samly assistant. I can help you understand how Samly works, explore its features, learn about pricing and guide you through registration. What would you like to know?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  links: [
    { label: 'Register Shop', route: '/register', domain: 'app' },
    { label: 'View Pricing (GH₵300)', route: '/pricing', domain: 'marketing' },
    { label: 'Core Features', route: '/features', domain: 'marketing' },
  ],
};

const SUGGESTED_QUESTIONS = [
  'What is Samly?',
  'How much does Samly cost?',
  'How do I register my shop?',
  'What can Samly help me manage?',
];

export const SamleyAIAssistant: React.FC<SamleyAIAssistantProps> = ({
  navigate,
  setDomain,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Extract quick navigation actions if AI response mentions specific routes
  const detectQuickLinks = (text: string): ChatLink[] => {
    const links: ChatLink[] = [];
    const lower = text.toLowerCase();

    if (lower.includes('/register') || lower.includes('register your shop') || lower.includes('registration page')) {
      links.push({ label: 'Go to Registration', route: '/register', domain: 'app' });
    }
    if (lower.includes('/login') || lower.includes('login to account') || lower.includes('login link')) {
      links.push({ label: 'Shop Login', route: '/login', domain: 'app' });
    }
    if (lower.includes('/pricing') || lower.includes('gh₵300') || lower.includes('subscription')) {
      links.push({ label: 'Pricing & MoMo', route: '/pricing', domain: 'marketing' });
    }
    if (lower.includes('/features') || lower.includes('inventory') || lower.includes('counter pos')) {
      links.push({ label: 'Platform Features', route: '/features', domain: 'marketing' });
    }
    if (lower.includes('/contact') || lower.includes('support team') || lower.includes('reach out')) {
      links.push({ label: 'Contact Support', route: '/contact', domain: 'marketing' });
    }
    if (lower.includes('/how-it-works') || lower.includes('how it works')) {
      links.push({ label: 'How It Works', route: '/how-it-works', domain: 'marketing' });
    }

    return links.slice(0, 3);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const history = messages
        .filter((m) => m.id !== 'intro-1')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/samley-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const replyText = data.reply || '';
        const detectedLinks = detectQuickLinks(replyText);

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          links: detectedLinks.length > 0 ? detectedLinks : undefined,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Honest error message when AI service is unavailable or key is unconfigured
        const errorText =
          data.code === 'API_KEY_NOT_CONFIGURED'
            ? 'SamleyAI is ready to connect with Gemini AI. In the meantime, you can explore our Features, Pricing, or Contact pages directly.'
            : data.error || 'SamleyAI is temporarily unavailable. Please try again shortly or contact support at /contact.';

        const fallbackLinks = detectQuickLinks(query);
        const resolvedLinks: ChatLink[] = [
          { label: 'View Pricing & Trial', route: '/pricing', domain: 'marketing' },
          { label: 'Contact Official Support', route: '/contact', domain: 'marketing' },
          ...fallbackLinks,
        ];

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: errorText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            links: resolvedLinks.slice(0, 3),
          },
        ]);
      }

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Network error communicating with SamleyAI. Please check your internet connection or visit /contact for support.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          links: [{ label: 'Contact Support', route: '/contact', domain: 'marketing' }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNavigateLink = (route: string, domain?: 'marketing' | 'app') => {
    if (domain) {
      setDomain(domain);
    }
    navigate(route);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open SamleyAI Chat Assistant"
          className="relative group px-4 py-3 bg-[#123B2A] text-[#F7F5EE] rounded-full shadow-xl hover:bg-[#1b523b] border border-[#C5A15A]/40 flex items-center gap-2.5 transition-all duration-200 transform hover:scale-105"
        >
          <div className="w-6 h-6 rounded-full bg-[#C5A15A] text-[#123B2A] flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold block leading-none text-white">SamleyAI</span>
            <span className="text-[10px] text-[#C5A15A] block leading-tight font-medium">
              Visitor Support
            </span>
          </div>

          {/* Unread indicator */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C5A15A] rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[410px] max-w-[420px] h-[550px] max-h-[82vh] bg-[#F7F5EE] border border-[#123B2A]/20 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden text-[#123B2A] animate-fade-in font-sans">
          {/* Header */}
          <div className="bg-[#123B2A] text-[#F7F5EE] px-4 py-3 flex items-center justify-between border-b border-[#C5A15A]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C5A15A] text-[#123B2A] flex items-center justify-center font-extrabold shadow-xs">
                <Bot className="w-4 h-4 text-[#123B2A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">SamleyAI</h3>
                  <span className="px-1.5 py-0.2 bg-emerald-900/80 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 rounded-full">
                    Official Support
                  </span>
                </div>
                <p className="text-[10px] text-[#F7F5EE]/75">
                  A product by SamTeck Digital · Visitor Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close SamleyAI"
              className="p-1 rounded-md text-[#F7F5EE]/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader info strip */}
          <div className="bg-[#C5A15A]/15 border-b border-[#C5A15A]/20 px-3.5 py-1.5 text-[10px] text-[#123B2A]/80 flex items-center justify-between">
            <span>Ask anything about Samly features, registration & pricing</span>
            <span className="font-semibold text-[#123B2A]">GH₵ 300/mo</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F7F5EE]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#123B2A] text-[#F7F5EE] rounded-br-xs'
                      : 'bg-white text-[#123B2A] border border-[#123B2A]/10 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Navigation chips attached to message */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
                      {msg.links.map((link, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigateLink(link.route, link.domain)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#123B2A]/5 hover:bg-[#123B2A]/10 text-[#123B2A] font-semibold text-[10px] border border-[#123B2A]/10 transition-all cursor-pointer"
                        >
                          <span>{link.label}</span>
                          <ChevronRight className="w-2.5 h-2.5 text-[#C5A15A]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#123B2A]/40 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing / Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-1 text-[11px] text-[#123B2A]/60 bg-white p-2.5 rounded-xl border border-[#123B2A]/10 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A15A] animate-spin" />
                <span>SamleyAI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Chips */}
          {messages.length <= 2 && (
            <div className="p-2.5 bg-white border-t border-[#123B2A]/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B2A]/60 block mb-1.5">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="text-[10px] text-left px-2.5 py-1 rounded-full bg-[#123B2A]/5 hover:bg-[#123B2A]/10 text-[#123B2A] border border-[#123B2A]/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#123B2A]/15 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask SamleyAI a question..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#123B2A]/20 focus:outline-none focus:ring-1 focus:ring-[#123B2A] bg-[#F7F5EE]/40 text-[#123B2A]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              aria-label="Send message"
              className="p-2 rounded-lg bg-[#123B2A] text-white hover:bg-[#1b523b] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
