import React, { useRef, useState, useEffect } from 'react';
import { 
  Send, 
  ImageIcon, 
  RotateCcw,
  Lightbulb,
  BrainCircuit,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    onSend(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-slate-50">
      <div className="max-w-3xl mx-auto space-y-4">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative inline-block"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                title="Remove image"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask axiom... (Shift+Enter for new line)"
            className="w-full bg-[#F9FAFB] border border-slate-200 rounded-[28px] pl-6 pr-24 py-5 text-sm ring-0 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none min-h-[64px] max-h-[200px]"
            rows={1}
          />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              onChange={handleImageUpload}
              accept="image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl hover:bg-slate-200 text-slate-400 transition-colors"
              title="Attach Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className={cn(
                "p-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:shadow-none",
                (input.trim() || selectedImage) ? "bg-indigo-600 text-white shadow-indigo-100" : "bg-slate-100 text-slate-300"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 py-1.5 px-3 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest">
              <Lightbulb className="w-3.5 h-3.5 text-orange-400" />
              Socratic Mode
            </button>
            <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 py-1.5 px-3 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              Analyze Planning
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300 font-black uppercase tracking-widest">
            <Command className="w-3 h-3" />
            Enter to Send
          </div>
        </div>
      </div>
    </div>
  );
}
