import React from 'react';
import { 
  Heart, 
  Moon, 
  Monitor, 
  Smile, 
  TrendingUp, 
  Zap,
  Play,
  RotateCcw,
  Coffee,
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function Wellness() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#141414]">Wellness & Focus</h2>
          <p className="text-[#8E9299] mt-1 font-medium">Balance your studies with mental well-being.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
              <p className="text-xs font-bold text-[#8E9299] uppercase tracking-wider">Balance Score</p>
              <p className="text-2xl font-black text-indigo-600">67</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pomodoro Timer */}
        <div className="md:col-span-2 bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm flex flex-col items-center justify-center space-y-8 min-h-[400px]">
           <p className="text-[10px] font-bold text-[#8E9299] uppercase tracking-[0.3em]">Deep Work Session</p>
           <div className="relative">
              <div className="w-56 h-56 rounded-full border-[12px] border-slate-50 flex items-center justify-center">
                 <span className="text-6xl font-black tabular-nums">25:00</span>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="100" fill="none" stroke="#6366F1" strokeWidth="12" strokeDasharray="628" strokeDashoffset="0" strokeLinecap="round" className="opacity-10" />
              </svg>
           </div>
           <div className="flex items-center gap-4">
              <button className="bg-[#141414] text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-slate-200">
                <Play className="w-5 h-5 fill-current" />
                Start Focus
              </button>
              <button className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 text-slate-400">
                <RotateCcw className="w-6 h-6" />
              </button>
           </div>
           <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs">Pomodoro</button>
              <button className="px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-400 font-bold text-xs transition-colors">Short Break</button>
              <button className="px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-400 font-bold text-xs transition-colors">Long Break</button>
           </div>
        </div>

        {/* Burnout Detection */}
        <div className="bg-[#141414] text-white rounded-[32px] p-8 space-y-6 flex flex-col justify-between">
           <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                 <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-2xl font-bold">Burnout Guard</h4>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                Based on your study hours and activity patterns, your burnout risk is currently <span className="text-emerald-400 font-bold italic">Low</span>.
              </p>
           </div>
           <div className="space-y-3">
              {[
                { label: 'Study Pace', val: 'Consistent' },
                { label: 'Break Ratio', val: 'Optimal' },
                { label: 'Late Nights', val: 'Low' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                   <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">{stat.label}</span>
                   <span className="text-xs font-bold text-emerald-400">{stat.val}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Moon, label: 'Sleep', value: '7.5h', sub: 'Target 8h', color: 'indigo' },
          { icon: Monitor, label: 'Screen Time', value: '4.2h', sub: 'Study included', color: 'blue' },
          { icon: Smile, label: 'Mood', value: 'Good', sub: 'Steady focus', color: 'emerald' },
          { icon: Brain, label: 'Ikigai', value: 'High', sub: 'Goal aligned', color: 'purple' },
        ].map((item, i) => (
           <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                'bg-purple-50 text-purple-600'
              )}>
                 <item.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-[#8E9299] uppercase tracking-wider">{item.label}</p>
                 <p className="text-2xl font-black text-[#141414]">{item.value}</p>
                 <p className="text-[11px] font-medium text-[#8E9299]">{item.sub}</p>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
