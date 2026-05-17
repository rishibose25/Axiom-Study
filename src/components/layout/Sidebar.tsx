import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  FileText, 
  BrainCircuit, 
  Clock, 
  ScrollText, 
  TrendingUp, 
  Heart, 
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  History,
  Wrench,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useProfile } from '../../hooks/useProfile';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { AxiomLogo } from './AxiomLogo';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navSections = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'plan', label: 'Plan', icon: Calendar },
      { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
      { id: 'tests', label: 'Test Log', icon: FileText },
    ]
  },
  {
    title: 'LEARNING TOOLS',
    items: [
      { id: 'planner', label: 'Smart Planner', icon: Sparkles, highlight: true },
      { id: 'tutor', label: 'AI Tutor', icon: BrainCircuit },
      { id: 'focus', label: 'Focus', icon: Clock },
    ]
  },
  {
    title: 'CONTENT',
    items: [
      { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
      { id: 'custom-syllabus', label: 'Custom Syllabus', icon: Wrench },
      { id: 'syllabus-preview', label: 'Syllabus Preview', icon: Eye },
    ]
  },
  {
    title: 'ANALYSIS',
    items: [
      { id: 'reports', label: 'Weekly Report', icon: TrendingUp },
      { id: 'backups', label: 'Backups', icon: History },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'wellness', label: 'Wellness', icon: Heart },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out fail", error);
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 overflow-y-auto shrink-0">
      <AxiomLogo size="md" className="mb-10 px-2" />

      <nav className="flex-1 space-y-8">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="px-3 text-[10px] font-bold text-[#8E9299] tracking-widest uppercase">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                    activeTab === item.id 
                      ? "bg-[#F5F5FF] text-[#6366F1]" 
                      : "text-[#8E9299] hover:bg-[#F9F9F9] hover:text-[#141414]"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    activeTab === item.id ? "text-[#6366F1]" : "group-hover:scale-110 transition-transform"
                  )} />
                  <span className="font-semibold text-[13px]">{item.label}</span>
                  {item.highlight && (
                    <Sparkles className="w-3 h-3 text-[#FACC15] ml-auto animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-[#EFEFEF]">
        <button 
          onClick={() => onTabChange('settings')}
          className="bg-[#F9FAFB] rounded-2xl p-4 mb-4 flex items-center gap-3 w-full text-left truncate group border border-transparent hover:border-slate-100 transition-all font-sans"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-sm">
             {profile?.photoURL ? (
               <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
             ) : (
               profile?.displayName?.charAt(0) || 'U'
             )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-[#141414] truncate">{profile?.displayName || 'User'}</p>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[10px] text-[#8E9299] truncate font-medium">{profile?.email}</p>
          </div>
        </button>

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#8E9299] hover:bg-red-50 hover:text-red-500 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold text-[13px]">Sign out</span>
        </button>
      </div>
    </div>
  );
}
