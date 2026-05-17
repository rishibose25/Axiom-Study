import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCcw,
  Layout,
  MessageSquare,
  Sparkles,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSidebar } from './ChatSidebar';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { AxiomLogo } from '../layout/AxiomLogo';
import { useAiTutor } from '../../hooks/useAiTutor';
import { useTasks } from '../../hooks/useTasks';
import { cn } from '../../lib/utils';

export function AiTutor() {
  const { 
    chats, 
    activeChatId, 
    setActiveChatId, 
    messages, 
    loading, 
    createChat, 
    sendMessage, 
    deleteChat,
    updateMessageFeedback,
    renameChat
  } = useAiTutor();

  const { addTask, updateTask } = useTasks();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-select latest chat if none active
  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  const handleSend = async (content: string, image?: string) => {
    let chatId = activeChatId;
    
    // Create new chat if none exists or active
    if (!chatId) {
      const title = content.split(' ').slice(0, 5).join(' ') || "New Conversation";
      chatId = await createChat(title);
    }

    if (!chatId) return;

    // Send user message
    await sendMessage(chatId, content, 'user');
    setIsGenerating(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const parts: any[] = [{ text: content }];
      if (image) {
        parts.unshift({
          inlineData: {
            mimeType: "image/jpeg",
            data: image.split(',')[1]
          }
        });
      }

      chatHistory.push({ role: 'user', parts });

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: chatHistory,
          useTools: true,
          systemInstruction: `You are Axiom AI, an elite tutor. 
          Respond in Markdown. 
          If the user asks about planning, revision, or adding tasks, use the add_task tool.
          Current Date: ${new Date().toISOString().split('T')[0]}`
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Send model message (including tool calls if any)
      await sendMessage(chatId, data.text || "I've processed your request.", 'model', data.functionCalls);

    } catch (error) {
      console.error("AI Error:", error);
      await sendMessage(chatId, "I'm sorry, I encountered an error. Please try again.", 'model');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptToolCall = async (msgId: string, name: string, args: any) => {
    if (name === 'add_task') {
      await addTask({
        title: args.title,
        subject: args.subject,
        duration: args.duration || 60,
        priority: (args.priority as any) || 'medium',
        scheduledDate: args.scheduledDate || new Date().toISOString().split('T')[0],
        type: (args.type as any) || 'study'
      });
      
      // Update message to remove the suggestion or mark as done (optionally)
      // For now, we'll just show a native notification or similar if we had one
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="overflow-hidden border-r border-slate-100"
          >
            <ChatSidebar 
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={setActiveChatId}
              onNewChat={handleNewChat}
              onDeleteChat={deleteChat}
              onRenameChat={renameChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative bg-white">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400"
            >
              <Layout className="w-5 h-5" />
            </button>
            <div className="h-6 w-[1px] bg-slate-100 mx-1" />
            <div className="flex items-center gap-3">
              <AxiomLogo size="sm" showText={false} />
              <div>
                <h3 className="font-black text-sm text-[#141414]">
                  {activeChatId ? chats.find(c => c.id === activeChatId)?.title : 'New AI Session'}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Neural Engine Active</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Reset
            </button>
            <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400">
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20">
          {activeChatId || messages.length > 0 ? (
            <MessageList 
              messages={messages} 
              isLoading={isGenerating}
              onFeedback={(msgId, type) => updateMessageFeedback(activeChatId!, msgId, type)}
              onAcceptToolCall={handleAcceptToolCall}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="shrink-0"
              >
                <AxiomLogo size="lg" showText={false} />
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-[#141414]">How can Axiom help?</h2>
                <p className="text-[#8E9299] text-sm font-medium max-w-sm mx-auto">
                  I'm your study partner. I can solve equations, translate notes, or optimize your revision schedule.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                {[
                  "Explain photosynthesis",
                  "Solve quadratic equations",
                  "Plan NEET biology revision",
                  "Summarize latest chemistry notes"
                ].map(prompt => (
                  <button 
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="p-5 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 text-xs font-bold text-slate-500 hover:text-indigo-600 text-left transition-all group"
                  >
                    <MessageSquare className="w-4 h-4 mb-2 text-slate-300 group-hover:text-indigo-400" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ChatInput onSend={handleSend} isLoading={isGenerating} />
        </div>
      </div>
    </div>
  );
}
