import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, Send, Sprout, Leaf, HelpCircle, User, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const ChatbotModule: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Hello ${user?.name || 'Farmer'}! I am your AgriAI Agricultural Assistant. How can I help you optimize your farm today?`,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sampleQuestions = [
    "Which crop is best for red soil?",
    "How much water does pomegranate need?",
    "What fertilizer is best for rice?",
    "What crops grow in sandy soils?"
  ];

  // Heuristics NLP matching engine
  const generateBotResponse = (query: string): string => {
    const text = query.toLowerCase();
    
    if (text.includes('red soil')) {
      return "Red soil is rich in iron and manganese but generally deficient in nitrogen, phosphorus, and humus. It has excellent drainage characteristics. The best crops for red soil are **Pomegranate**, **Cotton**, **Groundnuts**, **Pigeonpeas**, and **Chickpeas**. Adding organic manure is highly recommended to improve its moisture retention.";
    }
    if (text.includes('pomegranate') && (text.includes('water') || text.includes('irrigation'))) {
      return "Pomegranates require **Medium** water levels. During their vegetative state, they need consistent irrigation (approx. 15-20 liters/shrub daily via drip systems). However, during fruit ripening, reduce irrigation slightly—excessive or erratic watering causes the skin to crack, decreasing market quality.";
    }
    if (text.includes('rice') && text.includes('fertilizer')) {
      return "Rice is a heavy feeder of Nitrogen. The ideal fertilizer regime consists of **Urea** split into three applications: at transplanting, active tillering, and panicle initiation. Apply **DAP (Diammonium Phosphate)** during seedbed sowing to secure robust early root caps. Ensure soil pH is maintained between 5.5 and 6.5.";
    }
    if (text.includes('sandy') && text.includes('soil')) {
      return "Sandy soils drain water very quickly and have low nutrient storage. Deep-rooted crops or melons do best. Excellent crop selections include **Watermelons**, **Muskmelons**, **Coconuts**, and root crops like **Carrots** and **Potatoes**. Heavy mulching with organic material helps maintain top-soil dampness.";
    }
    if (text.includes('black') && text.includes('soil')) {
      return "Black soil (Regur soil) is clayey, deep, and highly moisture-retentive, though it cracks when dry. It is highly suited for **Cotton**, **Wheat**, **Soybeans**, and citrus varieties like **Oranges**. Avoid over-irrigation as it easily waterlogs.";
    }
    if (text.includes('fertilizer') || text.includes('urea') || text.includes('dap') || text.includes('potash')) {
      return "AgriAI suggests three primary fertilizers based on N-P-K tests:\n1. **Urea**: Supplies Nitrogen to fix yellow leaves and promote leaf vegetative growth.\n2. **DAP (Diammonium Phosphate)**: Supplies Phosphorus to encourage blooming and branching.\n3. **MOP (Muriate of Potash)**: Supplies Potassium to thick cell walls, fruit flavor, and drought immunity.";
    }
    if (text.includes('yield') || text.includes('area') || text.includes('profit')) {
      return "To forecast yield parameters and profits, navigate to the **Yield Prediction** page on the sidebar. Input your crop, land area, soil quality rating, and climate conditions, and the platform will output expected tonnage and net ROI.";
    }

    return "That's an interesting question! As your AgriAI assistant, I recommend checking our specific diagnostics modules:\n- Use **Crop Recommendation** to run soil analysis via our Random Forest model.\n- Use **Fertilizer Deficits** to diagnose N-P-K assays.\n- Try asking me specific questions like: 'pomegranate watering', 'red soil crops', or 'rice fertilizer'.";
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        sender: 'bot',
        text: generateBotResponse(textToSend),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col justify-between glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fadeIn">
      
      {/* Welcome header info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 flex items-center space-x-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
          <MessageSquareCode className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-sm">AI Agricultural Advisor</h4>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Online • Expert Heuristics
          </span>
        </div>
      </div>

      {/* Messages list container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
        
        {/* Sample questions helper bubble (only show when few messages) */}
        {messages.length === 1 && (
          <div className="space-y-2 text-left max-w-md mx-auto p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Try asking:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-250/55 dark:border-slate-800 hover:border-emerald-500 text-left text-xs font-semibold hover:text-emerald-500 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Chat Messages */}
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`
                p-4 rounded-2xl text-sm leading-relaxed max-w-md text-left whitespace-pre-line
                ${isUser 
                  ? 'bg-emerald-500 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm'
                }
              `}>
                {msg.text}
                <span className={`block text-[9px] mt-1 text-right ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-150 dark:bg-slate-800 border border-slate-200/30 overflow-hidden flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator loader */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none flex items-center space-x-1">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-xs text-slate-400">Typing advice...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input controls container */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="flex space-x-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your agricultural question..." 
            className="flex-1 h-12 px-4 rounded-xl glass-input text-sm focus:outline-none"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/15 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
