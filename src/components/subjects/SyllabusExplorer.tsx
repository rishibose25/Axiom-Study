import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Layers, 
  Plus, 
  Target,
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Check,
  Edit2,
  Eye,
  RefreshCcw,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SYLLABUS_DATA, SubjectSyllabus, Unit, Chapter } from '../../constants/syllabus';
import { useProfile } from '../../hooks/useProfile';
import { useSyllabusProgress } from '../../hooks/useSyllabusProgress';
import { SyllabusEditor } from './SyllabusEditor';
import { cn } from '../../lib/utils';
import { db, auth } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface SyllabusExplorerProps {
  mode?: 'tracking' | 'custom' | 'preview';
}

export function SyllabusExplorer({ mode = 'tracking' }: SyllabusExplorerProps) {
  const { profile, updateProfile } = useProfile();
  const { progress, toggleTopic } = useSyllabusProgress();
  
  const [selectedClass, setSelectedClass] = useState<string>(profile?.classLevel || 'Class 11');
  const [selectedStream, setSelectedStream] = useState<string>(profile?.syllabusStream || 'NEET');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [customSyllabi, setCustomSyllabi] = useState<Record<string, SubjectSyllabus>>({});
  const [isEditingInternal, setIsEditingInternal] = useState(false);

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  // Sync internal state with props
  const isCustomMode = mode === 'custom';
  const isPreviewMode = mode === 'preview';
  const isTrackingMode = mode === 'tracking';

  // Fetch custom syllabi from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/custom_syllabi`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const customs: Record<string, SubjectSyllabus> = {};
      snapshot.docs.forEach(doc => {
        customs[doc.id] = doc.data() as SubjectSyllabus;
      });
      setCustomSyllabi(customs);
    });
    return unsubscribe;
  }, []);

  const availableClasses = Object.keys(SYLLABUS_DATA);
  const availableStreams = SYLLABUS_DATA[selectedClass] ? Object.keys(SYLLABUS_DATA[selectedClass]) : [];

  const subjects = useMemo(() => {
    const base = (SYLLABUS_DATA[selectedClass] && SYLLABUS_DATA[selectedClass][selectedStream]) || [];
    // Merge or replace with custom syllabi if available
    return base.map(subj => {
      if (customSyllabi[subj.id]) {
        return customSyllabi[subj.id];
      }
      return subj;
    });
  }, [selectedClass, selectedStream, customSyllabi]);

  // If we are in tracking mode, we should always see the profile's syllabus
  useEffect(() => {
    if (isTrackingMode && profile) {
      setSelectedClass(profile.classLevel || 'Class 11');
      setSelectedStream(profile.syllabusStream || 'NEET');
    }
  }, [isTrackingMode, profile]);

  // Handle auto-selection of stream if class changes
  useEffect(() => {
    if (SYLLABUS_DATA[selectedClass] && !SYLLABUS_DATA[selectedClass][selectedStream]) {
      setSelectedStream(Object.keys(SYLLABUS_DATA[selectedClass])[0]);
    }
  }, [selectedClass, selectedStream]);

  // Set first subject as active if none selected or if subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      if (!activeSubjectId || !subjects.find(s => s.id === activeSubjectId)) {
        setActiveSubjectId(subjects[0].id);
      }
    }
  }, [subjects, activeSubjectId]);

  const activeSubject = subjects.find(s => s.id === activeSubjectId);

  const filteredUnits = useMemo(() => {
    if (!activeSubject) return [];
    if (!searchQuery) return activeSubject.units;

    return activeSubject.units.map(unit => ({
      ...unit,
      chapters: unit.chapters.filter(ch => 
        ch.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(unit => unit.chapters.length > 0);
  }, [activeSubject, searchQuery]);

  const overallStats = useMemo(() => {
    let totalTopics = 0;
    let completedTopicsCount = 0;
    
    subjects.forEach(subj => {
      subj.units.forEach(unit => {
        unit.chapters.forEach(ch => {
          const topics = ch.topics || [];
          totalTopics += topics.length;
          const prog = progress[ch.id];
          if (prog) {
            completedTopicsCount += prog.completedTopics.length;
          }
        });
      });
    });
    
    return {
      total: totalTopics,
      completed: completedTopicsCount,
      percent: totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0
    };
  }, [subjects, progress]);

  const handleAdoptSyllabus = async () => {
    if (confirm(`Do you want to switch your primary syllabus to ${selectedClass} - ${selectedStream}?`)) {
      await updateProfile({
        classLevel: selectedClass,
        syllabusStream: selectedStream
      });
    }
  };

  if (isCustomMode && isEditingInternal && activeSubject) {
    return (
      <SyllabusEditor 
        initialSyllabus={activeSubject}
        onSave={(updated) => {
          setCustomSyllabi(prev => ({ ...prev, [updated.id]: updated }));
          setIsEditingInternal(false);
        }}
        onCancel={() => setIsEditingInternal(false)}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Subject Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Class Selector */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Class Level
            </p>
            <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              {availableClasses.map(cls => (
                <button 
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                  } }
                  className={cn(
                    "py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
                    selectedClass === cls ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Selector */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Exam Stream
            </p>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-1">
              {availableStreams.map(stream => (
                <button 
                  key={stream}
                  onClick={() => {
                    setSelectedStream(stream);
                  }}
                  className={cn(
                    "flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
                    selectedStream === stream ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {stream}
                </button>
              ))}
            </div>
          </div>

          {/* Subject List */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Subjects</p>
            <div className="space-y-2">
              {subjects.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubjectId(subj.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                    activeSubjectId === subj.id 
                      ? "bg-white border border-indigo-100 shadow-xl shadow-indigo-50/50" 
                      : "hover:bg-white text-slate-400 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-all",
                    activeSubjectId === subj.id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300"
                  )}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-sm font-black transition-colors",
                    activeSubjectId === subj.id ? "text-indigo-900" : "text-slate-500 group-hover:text-slate-600"
                  )}>
                    {subj.name}
                  </span>
                  {customSyllabi[subj.id] && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" title="Customized" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!isPreviewMode && (
          <div className="mt-auto p-8">
            <div className="bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden group">
              <Sparkles className="absolute -right-2 -top-2 w-20 h-20 text-white/10 group-hover:scale-110 transition-transform" />
              <h4 className="font-black text-sm mb-2">Track Progress</h4>
              <p className="text-[10px] font-bold text-white/70 leading-relaxed mb-4">Complete your topics to unlock elite practice tests.</p>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallStats.percent}%` }}
                  className="h-full bg-emerald-400 rounded-full" 
                />
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black">{overallStats.percent}% Completed</p>
                <p className="text-[9px] font-bold text-white/50">{overallStats.completed}/{overallStats.total} Topics</p>
              </div>
            </div>
          </div>
        )}

        {isPreviewMode && (
          <div className="mt-auto p-8">
            <button 
              onClick={handleAdoptSyllabus}
              className="w-full bg-emerald-500 text-white py-4 rounded-[28px] font-black text-xs shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Adopt Syllabus
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#141414] tracking-tight">{activeSubject?.name} Syllabus</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-3 h-3 text-indigo-500" />
                {selectedClass} • {selectedStream} Curriculum
              </p>
            </div>
            
            {isPreviewMode ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                <Eye className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Preview Mode</span>
              </div>
            ) : isCustomMode && (
              <button 
                onClick={() => setIsEditingInternal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Customize
              </button>
            )}
          </div>

          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chapters..."
              className="w-full bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white rounded-[20px] py-3.5 pl-11 pr-5 text-xs font-bold outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {filteredUnits.map((unit, unitIdx) => (
              <motion.div 
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: unitIdx * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 ml-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black text-[#8E9299] uppercase tracking-[0.2em]">{unit.title}</h3>
                </div>

                <div className="space-y-3 ml-11">
                  {unit.chapters.map((chapter) => {
                    const chProgress = progress[chapter.id];
                    const completedCount = chProgress?.completedTopics.length || 0;
                    const totalCount = chapter.topics?.length || 0;
                    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    const isExpanded = expandedChapterId === chapter.id;

                    return (
                      <div 
                        key={chapter.id}
                        className={cn(
                          "bg-white border border-slate-100 rounded-[28px] overflow-hidden transition-all group",
                          isExpanded ? "ring-2 ring-indigo-500/20 shadow-2xl shadow-indigo-100" : "shadow-sm hover:shadow-xl hover:shadow-slate-100"
                        )}
                      >
                        <div 
                          className="p-5 cursor-pointer"
                          onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-inner",
                                percent === 100 ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"
                              )}>
                                {percent === 100 ? <CheckCircle2 className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-sm text-[#141414] group-hover:text-indigo-900 transition-colors truncate pr-2">{chapter.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 truncate">High Weightage</span>
                                  {percent > 0 && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        percent === 100 ? "text-emerald-500" : "text-indigo-400"
                                      )}>
                                        {percent === 100 ? 'Completed' : `${percent}% Done`}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                               {!isPreviewMode && (
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     // Quick add to plan functionality could go here
                                   }}
                                   className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                                 >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add to Plan
                                 </button>
                               )}
                               <div className={cn(
                                 "p-2 rounded-lg text-slate-200 group-hover:text-indigo-400 transition-all",
                                 isExpanded && "rotate-180"
                               )}>
                                 <ChevronDown className="w-5 h-5" />
                               </div>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center gap-4 pt-5 border-t border-slate-50">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={false}
                                animate={{ width: `${percent}%` }}
                                className={cn(
                                  "h-full rounded-full transition-colors",
                                  percent === 100 ? "bg-emerald-500" : "bg-indigo-500"
                                )} 
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">
                              {percent === 0 ? 'Not Started' : `${completedCount}/${totalCount} Topics`}
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && chapter.topics && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-slate-50/50 border-t border-slate-50"
                            >
                              <div className="p-6 pt-0 space-y-3 ml-12">
                                  {chapter.topics.map((topic) => {
                                    const isDone = chProgress?.completedTopics.includes(topic);
                                    // Allow marking topics as done in all modes as per request
                                    return (
                                      <div 
                                        key={topic}
                                        onClick={() => toggleTopic(chapter.id, topic)}
                                        className={cn(
                                          "flex items-center gap-3 p-3.5 rounded-2xl transition-all border group/topic cursor-pointer",
                                          isDone 
                                            ? "bg-emerald-50/30 border-emerald-100/50 text-emerald-900/40" 
                                            : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:shadow-sm"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                          isDone ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200" : "border-slate-200 group-hover/topic:border-indigo-400"
                                        )}>
                                          {isDone && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={cn(
                                          "text-xs font-bold transition-all",
                                          isDone ? "line-through opacity-50" : "opacity-100"
                                        )}>
                                          {topic}
                                        </span>
                                        {isDone && (
                                          <div className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-[8px] font-black uppercase tracking-tighter text-emerald-600">
                                            Done
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredUnits.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50 py-20">
              <Search className="w-16 h-16 text-slate-200" />
              <p className="text-slate-400 font-bold text-sm">No chapters found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
