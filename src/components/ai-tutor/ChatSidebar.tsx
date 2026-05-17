import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Trash2, 
  MoreVertical,
  Filter,
  Check,
  X,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chat } from '../../hooks/useAiTutor';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, name: string) => void;
}

const SUBJECTS = ["General", "Physics", "Chemistry", "Biology", "Maths", "English"];

export function ChatSidebar({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat,
  onRenameChat 
}: ChatSidebarProps) {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterSubject ? chat.subject === filterSubject : true;
    return matchesSearch && matchesFilter;
  });

  const handleStartRename = (chat: Chat) => {
    setEditingId(chat.id);
    setEditName(chat.title);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameChat(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-80 border-r border-slate-100 flex flex-col bg-white h-full shrink-0">
      <div className="p-6 space-y-4">
        <button 
          onClick={onNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setFilterSubject(null)}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              !filterSubject ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            All
          </button>
          {SUBJECTS.filter(s => s !== 'General').map(subj => (
            <button 
              key={subj}
              onClick={() => setFilterSubject(subj)}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                filterSubject === subj ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredChats.map(chat => (
            <motion.div
              layout
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group relative rounded-2xl p-4 cursor-pointer transition-all",
                activeChatId === chat.id 
                  ? "bg-indigo-50/50 border border-indigo-100/50" 
                  : "hover:bg-slate-50 border border-transparent"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  activeChatId === chat.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                )}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === chat.id ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input 
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRename(chat.id)}
                        className="w-full bg-white border border-indigo-200 rounded-md px-2 py-1 text-sm font-bold outline-none"
                      />
                      <button onClick={() => handleSaveRename(chat.id)} className="text-emerald-500"><Check className="w-4 h-4"/></button>
                      <button onClick={() => setEditingId(null)} className="text-rose-500"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-sm font-black truncate pr-4",
                          activeChatId === chat.id ? "text-indigo-900" : "text-[#141414]"
                        )}>
                          {chat.title}
                        </p>
                        <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded leading-none">
                          {chat.subject || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 truncate mt-1">
                        {chat.lastMessage || 'Start a conversation...'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 mt-2">
                        {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate()) + ' ago' : 'Just now'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <div className="absolute right-2 top-11 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartRename(chat);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-300 hover:text-indigo-600 shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-300 hover:text-rose-600 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
