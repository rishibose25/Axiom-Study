import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Target,
  Search, 
  Filter, 
  Calendar, 
  Award, 
  Clock, 
  BrainCircuit,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { useTestLog, TestRecord } from '../../hooks/useTestLog';
import { format } from 'date-fns';

export function TestLog() {
  const { testRecords, loading, addTestRecord } = useTestLog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    score: '',
    totalMarks: '',
    accuracy: '',
    timeTaken: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    reflections: '',
  });

  // Filters
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = useMemo(() => {
    return ['all', ...Array.from(new Set(testRecords.map(r => r.subject)))];
  }, [testRecords]);

  const filteredRecords = useMemo(() => {
    return testRecords.filter(r => {
      const matchesSubj = filterSubject === 'all' || r.subject === filterSubject;
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubj && matchesSearch;
    });
  }, [testRecords, filterSubject, searchQuery]);

  const stats = useMemo(() => {
    if (testRecords.length === 0) return null;
    const avgScore = testRecords.reduce((acc, r) => acc + (r.score / r.totalMarks), 0) / testRecords.length;
    const avgAccuracy = testRecords.reduce((acc, r) => acc + r.accuracy, 0) / testRecords.length;
    return {
      avgScore: Math.round(avgScore * 100),
      avgAccuracy: Math.round(avgAccuracy),
      totalTests: testRecords.length
    };
  }, [testRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let aiInsights = '';
    setIsAiGenerating(true);
    
    try {
      // Basic AI logic or fetch if needed
      const prompt = `Student Test Performance:
      Test: ${formData.title}
      Subject: ${formData.subject}
      Score: ${formData.score}/${formData.totalMarks}
      Accuracy: ${formData.accuracy}%
      Reflections: ${formData.reflections}
      
      Provide 3 brief, bullet-point improvement tips based on this performance.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      aiInsights = data.text;
    } catch (err) {
      console.error("AI Insight failed", err);
    } finally {
      setIsAiGenerating(false);
    }

    await addTestRecord({
      title: formData.title,
      subject: formData.subject,
      score: parseFloat(formData.score),
      totalMarks: parseFloat(formData.totalMarks),
      accuracy: parseFloat(formData.accuracy),
      timeTaken: parseFloat(formData.timeTaken),
      date: formData.date,
      reflections: formData.reflections,
      aiInsights: aiInsights
    });

    setIsModalOpen(false);
    setFormData({
      title: '',
      subject: '',
      score: '',
      totalMarks: '',
      accuracy: '',
      timeTaken: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      reflections: '',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#141414]">Test Log</h2>
          <p className="text-[#8E9299] text-[13px] font-bold uppercase tracking-widest mt-1">Deep analysis of your test performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Log New Test
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg. Accuracy', val: `${stats?.avgAccuracy || 0}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Recent Velocity', val: `${stats?.avgScore || 0}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Total Tests', val: stats?.totalTests || 0, icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
             <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center", s.bg, s.color)}>
                <s.icon className="w-8 h-8" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                <p className="text-3xl font-black text-[#141414]">{s.val}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           {/* Filters */}
           <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  className="w-full bg-[#F9FAFB] border border-slate-50 rounded-xl p-3 pl-12 text-xs font-bold outline-none"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none" 
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                >
                  {subjects.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
           </div>

           {/* Test Record List */}
           <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-[32px] border border-slate-100 animate-pulse" />
                ))
              ) : filteredRecords.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[40px] py-24 text-center space-y-4">
                   <BarChart3 className="w-16 h-16 text-slate-100 mx-auto" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No test records found</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <TestRecordCard key={record.id} record={record} />
                ))
              )}
           </div>
        </div>

        {/* Side Panel: Trends & Insights */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[40px] p-8 text-white space-y-8 shadow-2xl">
              <div className="flex items-center justify-between">
                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-indigo-300" />
                 </div>
                 <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest">Growth Trend</span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-2xl font-black italic">Up by 12% this week.</h4>
                 <p className="text-indigo-200/60 text-xs font-bold leading-relaxed">Your accuracy in Physics is catching up with Biology. Focused effort on mechanics is paying off.</p>
              </div>
              <div className="h-24 w-full flex items-end gap-1">
                 {[40, 20, 60, 45, 80, 50, 90, 75].map((h, i) => (
                   <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-300 rounded-t-lg"
                   />
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 <h4 className="font-black text-sm tracking-widest uppercase">Revision Alerts</h4>
              </div>
              <div className="space-y-6">
                 {filteredRecords.slice(0, 2).map((r, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-1 h-12 rounded-full bg-rose-500" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-[#141414]">{r.subject} mistakes</p>
                        <p className="text-[11px] text-slate-400 font-medium">Revisit weak areas from "{r.title}"</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Modal for logging new test */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Log Test Performance"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Test Title</label>
              <input 
                autoFocus
                className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Unit Test 4 - Mechanics"
                required
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Subject</label>
                <input 
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="Physics"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Date</label>
                <input 
                  type="date"
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Score</label>
                <input 
                  type="number"
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.score}
                  onChange={e => setFormData({...formData, score: e.target.value})}
                  placeholder="85"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Total Marks</label>
                <input 
                  type="number"
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.totalMarks}
                  onChange={e => setFormData({...formData, totalMarks: e.target.value})}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Accuracy %</label>
                <input 
                  type="number"
                  max="100"
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.accuracy}
                  onChange={e => setFormData({...formData, accuracy: e.target.value})}
                  placeholder="92"
                  required
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Time Taken (minutes)</label>
              <input 
                type="number"
                className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={formData.timeTaken}
                onChange={e => setFormData({...formData, timeTaken: e.target.value})}
                placeholder="60"
                required
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Reflections & Mistakes</label>
              <textarea 
                className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px] resize-none"
                value={formData.reflections}
                onChange={e => setFormData({...formData, reflections: e.target.value})}
                placeholder="What did you get wrong? Why?"
                required
              />
           </div>

           <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-8 py-5 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isAiGenerating}
                className="flex-2 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                )}
                {isAiGenerating ? 'Analyzing...' : 'Log & Get AI Insights'}
              </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}

function TestRecordCard({ record }: { record: TestRecord }) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.round((record.score / record.totalMarks) * 100);

  return (
    <motion.div 
      layout
      className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden group hover:border-indigo-100 transition-all"
    >
      <div 
        className="p-8 cursor-pointer flex flex-wrap items-center gap-8"
        onClick={() => setExpanded(!expanded)}
      >
         <div className={cn(
           "w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-xl shadow-lg shadow-black/5 shrink-0",
           percentage >= 90 ? "bg-emerald-500 text-white" : 
           percentage >= 75 ? "bg-indigo-500 text-white" : "bg-orange-500 text-white"
         )}>
           {percentage}%
         </div>

         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-3">
             <h4 className="font-black text-xl text-[#141414] truncate">{record.title}</h4>
             <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full tracking-widest">{record.subject}</span>
           </div>
           <div className="flex flex-wrap items-center gap-6 mt-2 text-slate-400">
             <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight">
                <Calendar className="w-4 h-4" />
                {record.date}
             </div>
             <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight">
                <Award className="w-4 h-4" />
                {record.score} / {record.totalMarks} Marks
             </div>
             <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight">
                <Clock className="w-4 h-4" />
                {record.timeTaken}m
             </div>
           </div>
         </div>

         <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
           {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
         </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 relative"
          >
             <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8E9299] flex items-center gap-2">
                        <Award className="w-3 h-3" /> Reflections
                      </p>
                      <div className="bg-slate-50 p-6 rounded-[24px] text-sm text-[#141414] font-medium leading-relaxed italic">
                        "{record.reflections}"
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                        <BrainCircuit className="w-3 h-3" /> AI Insights
                      </p>
                      <div className="bg-indigo-50 p-6 rounded-[24px] text-sm text-indigo-900 font-bold leading-relaxed whitespace-pre-wrap">
                        {record.aiInsights || "No insights generated for this record."}
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-[32px] flex flex-wrap items-center justify-around gap-8">
                   {[
                     { label: 'Accuracy', val: `${record.accuracy}%` },
                     { label: 'Mark/Min', val: (record.score / record.timeTaken).toFixed(1) },
                     { label: 'Mistake Rate', val: `${100 - record.accuracy}%` },
                   ].map((m, i) => (
                     <div key={i} className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                        <p className="text-xl font-black text-[#141414]">{m.val}</p>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
