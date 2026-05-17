import React from 'react';
import { 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../../hooks/useAiTutor';
import { cn } from '../../lib/utils';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onFeedback: (messageId: string, type: 'up' | 'down' | null) => void;
  onAcceptToolCall: (id: string, name: string, args: any) => void;
}

export function MessageList({ messages, isLoading, onFeedback, onAcceptToolCall }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-slate-50/30">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex gap-4 max-w-[85%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
            msg.role === 'user' ? "bg-white border-slate-200" : "bg-indigo-600 border-indigo-600 text-white"
          )}>
            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          
          <div className="space-y-3 group">
            <div className={cn(
              "p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-[#141414] text-white rounded-tr-none" 
                : "bg-white text-[#141414] border border-slate-100 rounded-tl-none"
            )}>
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>

            {/* Tool Calls Rendering */}
            {msg.functionCalls && msg.functionCalls.map((call, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Planning Suggestion</p>
                    <h4 className="font-black text-[#141414]">{call.name === 'add_task' ? 'Add New Task' : 'Update Task'}</h4>
                  </div>
                </div>

                <div className="bg-white/50 rounded-xl p-4 space-y-3">
                  {call.name === 'add_task' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
                        <span className="text-xs font-black text-indigo-900">{call.args.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Subject</span>
                        <span className="text-xs font-black text-indigo-900">{call.args.subject}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                        <span className="text-xs font-black text-indigo-900">{call.args.duration || 60} mins</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => onAcceptToolCall(msg.id, call.name, call.args)}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Confirm & Sync
                  </button>
                  <button className="flex-1 bg-white border border-slate-100 text-[#8E9299] rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Feedback Controls (Assistant only) */}
            {msg.role === 'model' && (
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button 
                  onClick={() => onFeedback(msg.id, msg.feedback === 'up' ? null : 'up')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    msg.feedback === 'up' ? "bg-emerald-50 text-emerald-600" : "hover:bg-slate-50 text-slate-300 hover:text-emerald-500"
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => onFeedback(msg.id, msg.feedback === 'down' ? null : 'down')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    msg.feedback === 'down' ? "bg-rose-50 text-rose-600" : "hover:bg-slate-50 text-slate-300 hover:text-rose-500"
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
      
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
            <Bot className="w-5 h-5" />
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
            </div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Axiom is thinking</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
