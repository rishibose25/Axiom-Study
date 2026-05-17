import React, { useMemo } from 'react';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Trophy, 
  Clock, 
  ChevronRight,
  Plus,
  BookOpen,
  Beaker,
  History,
  Target,
  Bookmark,
  FileText,
  TrendingUp,
  BrainCircuit,
  Calendar,
  Sun,
  Moon,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { AxiomLogo } from '../layout/AxiomLogo';
import { useTasks } from '../../hooks/useTasks';
import { useProfile } from '../../hooks/useProfile';
import { format, isSameDay } from 'date-fns';

const studyData = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.3 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 3.2 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 0.5 },
  { day: 'Sun', hours: 0 },
];

export function Dashboard() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { profile, loading: profileLoading } = useProfile();

  const todayTasks = useMemo(() => {
    return tasks.filter(t => isSameDay(new Date(t.scheduledDate), new Date()));
  }, [tasks]);

  const completedToday = todayTasks.filter(t => t.isCompleted);
  const totalDurationToday = todayTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const completedDurationToday = completedToday.reduce((acc, t) => acc + (t.duration || 0), 0);
  
  const targetDuration = profile?.dailyGoalMinutes || 120;
  const progressToGoal = Math.min(100, Math.round((completedDurationToday / targetDuration) * 100));

  if (tasksLoading || profileLoading) {
    return (
      <div className="max-w-6xl mx-auto p-10 space-y-10 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-lg w-1/3" />
        <div className="h-64 bg-slate-50 rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#141414] mb-1">Good evening, {profile?.displayName?.split(' ')[0] || 'User'} 👋</h2>
          {profile?.ikigai && (
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1 italic">"{profile.ikigai}"</p>
          )}
          <p className="text-[#8E9299] text-[13px] font-medium uppercase tracking-widest">
            {targetDuration - completedDurationToday > 0 
              ? `${Math.floor((targetDuration - completedDurationToday) / 60)}h ${ (targetDuration - completedDurationToday) % 60}m to today's goal.`
              : 'Daily goal reached! Keep it up.'}
          </p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <button className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Sun className="w-5 h-5 text-slate-400" />
           </button>
           <button className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Moon className="w-5 h-5 text-slate-400" />
           </button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
              <LayoutDashboard className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Row 1, Col 1-2: Today's Focus */}
        <div className="lg:col-span-8 bg-white rounded-[20px] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
          <div className="flex-1 space-y-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8E9299] mb-4">Today's Focus</p>
              <h3 className="text-3xl font-black leading-tight mb-6">Complete 2 hours of focused study</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-[#141414]">{completedDurationToday}m</span>
                <span className="text-sm font-bold text-slate-300">/ {targetDuration / 60}h</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToGoal}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[13px] flex items-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                <Play className="w-4 h-4 fill-current" />
                Start a Pomodoro
              </button>
              <button className="p-4 rounded-2xl border border-slate-100 text-indigo-500 hover:bg-indigo-50 transition-colors shadow-sm flex items-center justify-center">
                <AxiomLogo size="sm" showText={false} />
              </button>
            </div>
          </div>

          <div className="relative">
             <div className="w-48 h-48 rounded-full flex items-center justify-center relative">
                <div className="text-center z-10">
                  <p className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1">Daily Goal</p>
                  <p className="text-5xl font-black text-[#141414]">{targetDuration / 60}h</p>
                  <p className="text-[10px] font-bold text-[#8E9299] mt-1">{completedDurationToday}m completed</p>
                </div>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="96" cy="96" r="80"
                    fill="none"
                    stroke="#EFEFEF"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="opacity-20"
                  />
                  <motion.circle
                    cx="96" cy="96" r="80"
                    fill="none"
                    stroke="url(#studyGradient)"
                    strokeWidth="10"
                    strokeDasharray="502"
                    initial={{ strokeDashoffset: 502 }}
                    animate={{ strokeDashoffset: 502 - (502 * progressToGoal / 100) }}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="studyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
             </div>
          </div>
        </div>

        {/* Row 1, Col 3: Streak */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-slate-100 p-8 shadow-sm flex flex-col justify-between group">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-black text-[#8E9299] uppercase tracking-[0.2em] mb-4">Streak</p>
               <p className="text-5xl font-black text-[#141414]">{profile?.streak || 0}</p>
               <p className="text-sm font-bold text-slate-400 mt-2">days</p>
             </div>
             <div className="w-14 h-14 rounded-[18px] bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
             </div>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-4">Keep it going!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Row 2: Charts */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white rounded-[20px] border border-slate-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Today</p>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black">{completedDurationToday}m</p>
                <p className="text-xs text-slate-400 font-bold">{progressToGoal}% of {targetDuration / 60}h goal</p>
              </div>
              <div className="h-28 w-full border-t border-dashed border-slate-100 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studyData}>
                    <Line type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white rounded-[20px] border border-slate-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">This Week</p>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black">1.8h</p>
                <p className="text-xs text-slate-400 font-bold">avg / day</p>
              </div>
              <div className="h-28 w-full border-t border-dashed border-slate-100 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studyData}>
                    <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Row 2, Col 3: Balance */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-slate-100 p-8 shadow-sm space-y-8 flex flex-col justify-between group">
           <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-[10px] font-black text-[#8E9299] uppercase tracking-[0.2em] mb-4">Balance</p>
                   <p className="text-5xl font-black text-[#141414]">{profile?.xp || 0}</p>
                   <p className="text-sm font-bold text-slate-400 mt-2">XP points</p>
                </div>
                <div className="w-14 h-14 rounded-[18px] bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                   <Trophy className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Level {profile?.level || 1}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (profile?.xp || 0) % 100)}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xl tracking-tight text-[#141414]">SUBJECTS</h4>
          <button className="text-sm font-black text-indigo-500 flex items-center gap-1 hover:gap-2 transition-all group">
            View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Physics', icon: BrainCircuit, color: '#6366F1', chapters: '0 / 24', progress: 0 },
            { name: 'Chemistry', icon: Beaker, color: '#10B981', chapters: '0 / 30', progress: 0 },
            { name: 'Biology', icon: BookOpen, color: '#F43F5E', chapters: '0 / 28', progress: 0 },
            { name: 'Mathematics', icon: Target, color: '#F59E0B', chapters: '0 / 26', progress: 0 },
          ].map((subj, i) => {
            const subjTasks = tasks.filter(t => t.subject.toLowerCase() === subj.name.toLowerCase());
            const completed = subjTasks.filter(t => t.isCompleted).length;
            const progress = subjTasks.length > 0 ? Math.round((completed / subjTasks.length) * 100) : 0;
            return (
              <div key={i} className="bg-white rounded-[20px] border border-slate-100 p-8 shadow-sm hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-10 transition-colors" style={{ backgroundColor: `${subj.color}15`, color: subj.color }}>
                  <subj.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-4">
                  <h5 className="font-black text-xl text-[#141414]">{subj.name}</h5>
                  <p className="text-[11px] text-[#8E9299] font-bold uppercase tracking-widest">{subj.chapters} chapters</p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black">{progress}%</p>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ backgroundColor: subj.color }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Area: Plan + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between">
            <h4 className="font-bold text-xl tracking-tight uppercase">Today's Plan</h4>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
          
          <div className="space-y-3">
             {todayTasks.length === 0 ? (
               <div className="bg-white rounded-[20px] border border-dashed border-slate-200 p-16 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-[#8E9299] font-bold text-sm mb-8 leading-relaxed max-w-xs mx-auto">No tasks scheduled for today.</p>
                  <button className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-[13px] shadow-xl shadow-indigo-100 flex items-center gap-3 mx-auto hover:scale-105 active:scale-95 transition-all">
                  <AxiomLogo size="sm" showText={false} />
                  Generate Plan
              </button>
               </div>
             ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="bg-white border border-slate-100 p-5 rounded-[24px] flex items-center gap-4 group">
                     <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 transition-colors",
                       task.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-100 text-slate-200"
                     )}>
                        {task.isCompleted && <CheckCircle2 className="w-5 h-5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className={cn("font-bold text-sm truncate", task.isCompleted && "line-through text-slate-400")}>{task.title}</p>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">{task.subject}</p>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-[#141414]">{task.duration}m</p>
                        <p className={cn(
                           "text-[9px] font-black uppercase tracking-widest",
                           task.priority === 'high' ? "text-rose-500" : task.priority === 'medium' ? "text-orange-500" : "text-emerald-500"
                        )}>{task.priority}</p>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h4 className="font-bold text-xl tracking-tight uppercase">Quick Actions</h4>
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Start Test', desc: 'Mock or chapter test', icon: FileText, color: '#6366F1' },
                { label: 'Revise', desc: 'Smart revision', icon: History, color: '#10B981' },
                { label: 'View Insights', desc: 'Detailed analytics', icon: TrendingUp, color: '#3B82F6' },
                { label: 'Bookmarks', desc: 'Saved resources', icon: Bookmark, color: '#F59E0B' },
              ].map((action, i) => (
                <button key={i} className="flex flex-col items-start gap-4 p-6 rounded-[20px] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all text-left">
                  <div className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-[#141414] mb-1">{action.label}</span>
                    <span className="block text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tight">{action.desc}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
