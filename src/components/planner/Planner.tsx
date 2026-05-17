import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  MoreVertical, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  Trash,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { AxiomLogo } from '../layout/AxiomLogo';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format, addDays, isSameDay } from 'date-fns';
import { useTasks, Task } from '../../hooks/useTasks';

export function Planner() {
  const { tasks, loading } = useTasks();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'complete', taskId: string } | null>(null);
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState<Partial<Task>[]>([]);
  
  // Filters & Sorting
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const subjects = useMemo(() => {
    const list = Array.from(new Set(tasks.map(t => t.subject)));
    return ['all', ...list] as string[];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSubj = filterSubject === 'all' || t.subject === filterSubject;
        const matchesPrior = filterPriority === 'all' || t.priority === filterPriority;
        const matchesStatus = filterStatus === 'all' || 
          (filterStatus === 'pending' && !t.isCompleted) || 
          (filterStatus === 'completed' && t.isCompleted);
        return matchesSubj && matchesPrior && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.scheduledDate).getTime();
          const dateB = new Date(b.scheduledDate).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          const pMap = { high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc' ? pMap[a.priority] - pMap[b.priority] : pMap[b.priority] - pMap[a.priority];
        }
      });
  }, [tasks, filterSubject, filterPriority, filterStatus, sortBy, sortOrder]);

  const generateAiPlan = async () => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on my current tasks and subjects, generate a study plan for today (${format(new Date(), 'yyyy-MM-dd')}).
          Current Tasks: ${tasks.map(t => t.title).join(', ')}
          Output a JSON array of 3-5 new tasks with fields: title, description, subject, priority(low,medium,high), duration(minutes).
          Do not include existing tasks. Keep it realistic for a student.`,
          systemInstruction: "You are an expert academic planner. Always return a raw JSON array of task objects."
        })
      });
      const data = await response.json();
      const text = data.text.replace(/```json|```/g, '').trim();
      const newTasks = JSON.parse(text);
      setAiGeneratedTasks(newTasks);
      setIsAiPlanModalOpen(true);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setAiGenerating(false);
    }
  };

  const saveTask = async (taskData: Partial<Task>) => {
    if (!auth.currentUser) return;
    try {
      if (taskData.id) {
        const { id, ...rest } = taskData;
        await updateDoc(doc(db, 'tasks', id), {
          ...rest,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          userId: auth.currentUser.uid,
          isCompleted: false,
          type: taskData.type || 'study',
          createdAt: serverTimestamp(),
          scheduledDate: taskData.scheduledDate || format(new Date(), 'yyyy-MM-dd')
        });
      }
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };

  const handleTaskAction = async () => {
    if (!confirmAction) return;
    const { type, taskId } = confirmAction;

    try {
      if (type === 'delete') {
        await deleteDoc(doc(db, 'tasks', taskId));
      } else if (type === 'complete') {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        await updateDoc(doc(db, 'tasks', taskId), {
          isCompleted: !task.isCompleted,
          completedAt: !task.isCompleted ? serverTimestamp() : null
        });

        // Spaced Repetition Logic: If completed, schedule revision 1 day later
        if (!task.isCompleted && task.type !== 'revision') {
           await addDoc(collection(db, 'tasks'), {
             userId: auth.currentUser?.uid,
             title: `Revision: ${task.title}`,
             subject: task.subject,
             subjectId: task.subjectId || '',
             priority: 'medium',
             duration: Math.max(15, Math.floor(task.duration / 2)),
             isCompleted: false,
             type: 'revision',
             scheduledDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
             createdAt: serverTimestamp()
           });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    } finally {
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
    }
  };

  const acceptAiPlan = async () => {
    for (const task of aiGeneratedTasks) {
      await saveTask(task);
    }
    setIsAiPlanModalOpen(false);
    setAiGeneratedTasks([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#141414]">Smart Planner</h2>
          <p className="text-[#8E9299] text-[13px] font-bold uppercase tracking-widest mt-1">AI-optimized schedule & Spaced Repetition.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => {
               setEditingTask({});
               setIsEditModalOpen(true);
             }}
             className="bg-white border border-slate-100 flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-sm hover:bg-slate-50 transition-colors"
           >
              <Plus className="w-4 h-4" />
              New Task
           </button>
           <button 
             onClick={generateAiPlan}
             disabled={aiGenerating}
             className="bg-indigo-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
           >
              {aiGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <AxiomLogo size="sm" showText={false} />
              )}
              {aiGenerating ? 'Planning...' : 'Plan with AI'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           {/* Filters */}
           <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent text-xs font-bold outline-none" 
                  value={filterSubject} 
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  {subjects.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent text-xs font-bold outline-none" 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">ALL PRIORITIES</option>
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                  <option value="low">LOW</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent text-xs font-bold outline-none" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">SORT BY DATE</option>
                  <option value="priority">SORT BY PRIORITY</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              
              <div className="hidden sm:flex gap-1 ml-auto">
                 {['all', 'pending', 'completed'].map((s) => (
                   <button 
                    key={s}
                    onClick={() => setFilterStatus(s as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      filterStatus === s ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white text-slate-400 hover:text-slate-600"
                    )}
                   >
                    {s}
                   </button>
                 ))}
              </div>
           </div>

           {/* Task List */}
           <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />)}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[32px] p-20 text-center space-y-4">
                   <Calendar className="w-12 h-12 text-slate-200 mx-auto" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tasks found</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task) => (
                    <motion.div 
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "bg-white border p-6 rounded-[28px] flex items-center gap-6 group hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/30 transition-all",
                        task.isCompleted ? "opacity-60 grayscale-[0.4]" : "border-slate-50 shadow-sm"
                      )}
                    >
                       <button 
                         onClick={() => {
                           setConfirmAction({ type: 'complete', taskId: task.id });
                           setIsConfirmModalOpen(true);
                         }}
                         className={cn(
                           "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 shadow-sm",
                           task.isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-100 group-hover:border-emerald-200"
                         )}
                       >
                          {task.isCompleted && <CheckCircle2 className="w-6 h-6 text-white" />}
                       </button>
                       
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h5 className={cn("font-black text-lg truncate", task.isCompleted && "line-through text-slate-400")}>
                              {task.title}
                            </h5>
                            {task.type === 'revision' && (
                              <div className="bg-orange-50 text-orange-500 text-[9px] font-black px-2 py-0.5 rounded-lg border border-orange-100 uppercase tracking-widest flex items-center gap-1">
                                <History className="w-2.5 h-2.5" /> Revision
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                                  {task.subject}
                                </span>
                             </div>
                             <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                {format(new Date(task.scheduledDate), 'MMM d')} • {task.duration}m
                             </div>
                             <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest">
                                <AlertCircle className={cn(
                                  "w-3.5 h-3.5",
                                  task.priority === 'high' ? "text-rose-500" : 
                                  task.priority === 'medium' ? "text-orange-500" : "text-emerald-400"
                                )} />
                                <span className={cn(
                                  task.priority === 'high' ? "text-rose-500" : 
                                  task.priority === 'medium' ? "text-orange-500" : "text-emerald-400"
                                )}>{task.priority}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button 
                           onClick={() => {
                             setEditingTask(task);
                             setIsEditModalOpen(true);
                           }}
                           className="p-3 rounded-xl border border-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center overflow-hidden"
                         >
                            <AxiomLogo size="sm" showText={false} />
                         </button>
                         <button 
                           onClick={() => {
                             setConfirmAction({ type: 'delete', taskId: task.id });
                             setIsConfirmModalOpen(true);
                           }}
                           className="p-3 rounded-xl border border-slate-50 text-slate-300 hover:text-rose-500 hover:bg-red-50 transition-all shadow-sm"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* AI Insight Box */}
           <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-[32px] p-8 text-white space-y-8 shadow-2xl shadow-indigo-200">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                   <AxiomLogo size="sm" showText={false} />
                 </div>
                 <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Spaced Repetition Active</span>
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black leading-tight italic">Improve retention by 40%.</h4>
                <p className="text-sm text-indigo-100/70 font-bold leading-relaxed">
                  Completing a study task automatically schedules a revision for tomorrow. Stick to the intervals to master topics.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {[1, 3, 7].map(d => (
                   <div key={d} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                     <p className="text-xs font-black">{d}d</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Metrics Card */}
           <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-8">
              <h4 className="font-black text-sm tracking-widest uppercase text-slate-400">Activity Overview</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Today\'s Completion', val: '75%', color: 'from-emerald-400 to-emerald-600', icon: CheckCircle2 },
                   { label: 'Weekly Velocity', val: '92%', color: 'from-indigo-500 to-indigo-700', icon: TrendingUp },
                 ].map((stat, i) => (
                    <div key={i} className="space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <stat.icon className="w-4 h-4 text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</span>
                          </div>
                          <span className="text-xl font-black text-[#141414]">{stat.val}</span>
                       </div>
                       <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: stat.val }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={cn("h-full rounded-full bg-gradient-to-r shadow-sm", stat.color)} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={editingTask?.id ? "Edit Task" : "Create New Task"}
      >
        <div className="space-y-6">
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Task Title</label>
             <input 
               autoFocus
               className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
               value={editingTask?.title || ''} 
               onChange={e => setEditingTask({...editingTask, title: e.target.value})}
               placeholder="e.g., Revise laws of motion"
             />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Subject</label>
               <input 
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={editingTask?.subject || ''} 
                 onChange={e => setEditingTask({...editingTask, subject: e.target.value})}
                 placeholder="Physics"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Date</label>
               <input 
                 type="date"
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={editingTask?.scheduledDate || format(new Date(), 'yyyy-MM-dd')} 
                 onChange={e => setEditingTask({...editingTask, scheduledDate: e.target.value})}
               />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Priority</label>
               <select 
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={editingTask?.priority || 'medium'} 
                 onChange={e => setEditingTask({...editingTask, priority: e.target.value as any})}
               >
                 <option value="high">High</option>
                 <option value="medium">Medium</option>
                 <option value="low">Low</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Duration (min)</label>
               <input 
                 type="number"
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={editingTask?.duration || 30} 
                 onChange={e => setEditingTask({...editingTask, duration: parseInt(e.target.value)})}
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Description</label>
             <textarea 
               className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
               value={editingTask?.description || ''} 
               onChange={e => setEditingTask({...editingTask, description: e.target.value})}
               placeholder="Details about your study goals..."
             />
           </div>

           <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-8 py-4 rounded-2xl font-black text-[13px] border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveTask(editingTask!)}
                className="flex-[2] px-8 py-4 rounded-2xl font-black text-[13px] bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Save Task
              </button>
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        title={confirmAction?.type === 'delete' ? "Delete Task?" : "Update Task Status?"}
      >
        <div className="space-y-8 text-center py-4">
           <div className={cn(
             "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg",
             confirmAction?.type === 'delete' ? "bg-red-50 text-red-500 shadow-red-100" : "bg-emerald-50 text-emerald-500 shadow-emerald-100"
           )}>
              {confirmAction?.type === 'delete' ? <Trash className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
           </div>
           <div className="space-y-3">
             <h4 className="text-2xl font-black">Are you sure?</h4>
             <p className="text-[#8E9299] font-bold text-sm leading-relaxed px-4">
               {confirmAction?.type === 'delete' 
                 ? "This action cannot be undone. You will lose this task forever." 
                 : "This will update your daily progress and sync with your study plan."}
             </p>
           </div>
           <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 px-8 py-4 rounded-2xl font-black text-[13px] border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Go back
              </button>
              <button 
                onClick={handleTaskAction}
                className={cn(
                  "flex-1 px-8 py-4 rounded-2xl font-black text-[13px] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95",
                  confirmAction?.type === 'delete' ? "bg-red-500 shadow-red-100" : "bg-emerald-500 shadow-emerald-100"
                )}
              >
                Confirm
              </button>
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isAiPlanModalOpen} 
        onClose={() => setIsAiPlanModalOpen(false)} 
        title="AI Proposed Study Plan"
        className="max-w-2xl"
      >
         <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4">
               <AxiomLogo size="sm" showText={false} className="mt-1" />
               <div>
                  <h5 className="font-black text-indigo-900">Custom plan ready!</h5>
                  <p className="text-indigo-700/70 text-[13px] font-bold mt-1">
                    I've analyzed your progress and created a balanced schedule to maximize retention.
                  </p>
               </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {aiGeneratedTasks.map((t, i) => (
                 <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-[24px] space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t.subject}</p>
                          <h6 className="font-bold text-lg">{t.title}</h6>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-400">{t.duration}m</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.15em]",
                            t.priority === 'high' ? "text-red-500" : t.priority === 'medium' ? "text-orange-500" : "text-emerald-500"
                          )}>{t.priority}</span>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{t.description}</p>
                 </div>
               ))}
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-50">
               <button 
                 onClick={() => {
                   setIsAiPlanModalOpen(false);
                   generateAiPlan();
                 }}
                 className="flex-1 px-8 py-4 rounded-2xl font-black text-[13px] border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                 <RotateCcw className="w-4 h-4" />
                 Regenerate
               </button>
               <button 
                 onClick={acceptAiPlan}
                 className="flex-[2] px-8 py-4 rounded-2xl font-black text-[13px] bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
               >
                 Accept & Save Plan
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
