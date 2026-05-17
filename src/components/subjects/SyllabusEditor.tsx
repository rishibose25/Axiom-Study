import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  ChevronRight, 
  Layers,
  BookOpen,
  X,
  Check,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubjectSyllabus, Unit, Chapter } from '../../constants/syllabus';
import { cn } from '../../lib/utils';
import { db, auth } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SyllabusEditorProps {
  initialSyllabus: SubjectSyllabus;
  onSave: (syllabus: SubjectSyllabus) => void;
  onCancel: () => void;
}

// Editable Text Component for Topics and Titles
interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function EditableText({ value, onChange, className, placeholder }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue.trim() !== value) {
      onChange(tempValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full bg-indigo-50/50 outline-none ring-1 ring-indigo-200 rounded px-1",
          className
        )}
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text hover:bg-slate-50 transition-colors rounded px-1 inline-block min-w-[20px]",
        !value.trim() && "text-red-400 italic",
        className
      )}
    >
      {value.trim() || placeholder || 'Empty'}
    </span>
  );
}

// Sortable Topic Item
interface SortableTopicProps {
  id: string;
  topic: string;
  onUpdate: (val: string) => void;
  onRemove: () => void;
  index: number;
}

function SortableTopic({ id, topic, onUpdate, onRemove }: SortableTopicProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group bg-white p-2 rounded-xl border border-transparent hover:border-slate-100 transition-all">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-200 hover:text-slate-400">
        <GripVertical className="w-3 h-3" />
      </div>
      <EditableText 
        value={topic}
        onChange={onUpdate}
        placeholder="Topic name..."
        className="flex-1 text-[11px] font-bold text-slate-600"
      />
      <button 
        onClick={onRemove}
        className="p-1.5 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Sortable Chapter Item
interface SortableChapterProps {
  unitId: string;
  chapter: Chapter;
  onUpdateTitle: (title: string) => void;
  onRemove: () => void;
  onAddTopic: () => void;
  onUpdateTopic: (idx: number, val: string) => void;
  onRemoveTopic: (idx: number) => void;
  onReorderTopics: (oldIdx: number, newIdx: number) => void;
}

function SortableChapter({ 
  chapter, 
  onUpdateTitle, 
  onRemove, 
  onAddTopic, 
  onUpdateTopic, 
  onRemoveTopic,
  onReorderTopics
}: SortableChapterProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = (chapter.topics || []).findIndex((_, i) => `topic-${chapter.id}-${i}` === active.id);
      const newIndex = (chapter.topics || []).findIndex((_, i) => `topic-${chapter.id}-${i}` === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderTopics(oldIndex, newIndex);
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6 transition-all",
      isDragging && "opacity-50 ring-2 ring-indigo-500/20"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-200 hover:text-slate-400">
             <GripVertical className="w-4 h-4" />
           </div>
           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <BookOpen className="w-5 h-5" />
           </div>
           <EditableText 
             value={chapter.title}
             onChange={onUpdateTitle}
             placeholder="Chapter title..."
             className={cn("font-black text-sm text-[#141414]", !chapter.title.trim() && "text-red-500")}
           />
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-slate-200 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Topics</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={(chapter.topics || []).map((_, i) => `topic-${chapter.id}-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {chapter.topics?.map((topic, tIdx) => (
                <SortableTopic 
                  key={`topic-${chapter.id}-${tIdx}`}
                  id={`topic-${chapter.id}-${tIdx}`}
                  topic={topic}
                  index={tIdx}
                  onUpdate={(val) => onUpdateTopic(tIdx, val)}
                  onRemove={() => onRemoveTopic(tIdx)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <button 
          onClick={onAddTopic}
          className="w-full py-2 bg-slate-50 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black text-slate-400 hover:border-indigo-100 hover:text-indigo-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
        >
          <Plus className="w-3 h-3" />
          Add Topic
        </button>
      </div>
    </div>
  );
}

// Sortable Unit Item
interface SortableUnitProps {
  unit: Unit;
  onUpdateTitle: (title: string) => void;
  onRemove: () => void;
  onAddChapter: () => void;
  onRemoveChapter: (id: string) => void;
  onUpdateChapterTitle: (id: string, text: string) => void;
  onAddTopic: (chId: string) => void;
  onRemoveTopic: (chId: string, idx: number) => void;
  onUpdateTopic: (chId: string, idx: number, val: string) => void;
  onReorderChapters: (oldIdx: number, newIdx: number) => void;
  onReorderTopics: (chId: string, oldIdx: number, newIdx: number) => void;
}

function SortableUnit({ 
  unit, 
  onUpdateTitle, 
  onRemove, 
  onAddChapter,
  onRemoveChapter,
  onUpdateChapterTitle,
  onAddTopic,
  onRemoveTopic,
  onUpdateTopic,
  onReorderChapters,
  onReorderTopics
}: SortableUnitProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = unit.chapters.findIndex((c) => c.id === active.id);
      const newIndex = unit.chapters.findIndex((c) => c.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderChapters(oldIndex, newIndex);
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("space-y-4", isDragging && "opacity-50")}>
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-indigo-400">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
          </div>
          <EditableText 
            value={unit.title}
            onChange={onUpdateTitle}
            placeholder="Unit title..."
            className={cn("text-xs font-black text-[#141414] uppercase tracking-[0.2em]", !unit.title.trim() && "text-red-500")}
          />
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={unit.chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {unit.chapters.map((chapter) => (
              <SortableChapter 
                key={chapter.id}
                unitId={unit.id}
                chapter={chapter}
                onUpdateTitle={(val) => onUpdateChapterTitle(chapter.id, val)}
                onRemove={() => onRemoveChapter(chapter.id)}
                onAddTopic={() => onAddTopic(chapter.id)}
                onRemoveTopic={(idx) => onRemoveTopic(chapter.id, idx)}
                onUpdateTopic={(idx, val) => onUpdateTopic(chapter.id, idx, val)}
                onReorderTopics={(old, newVal) => onReorderTopics(chapter.id, old, newVal)}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <button 
          onClick={onAddChapter}
          className="h-32 border-2 border-dashed border-slate-100 rounded-[28px] text-[11px] font-black text-slate-300 hover:border-indigo-100 hover:text-indigo-400 transition-all uppercase tracking-widest flex flex-col items-center justify-center gap-3 bg-white/30"
        >
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          Add Chapter
        </button>
      </div>
    </div>
  );
}

export function SyllabusEditor({ initialSyllabus, onSave, onCancel }: SyllabusEditorProps) {
  const [syllabus, setSyllabus] = useState<SubjectSyllabus>(JSON.parse(JSON.stringify(initialSyllabus)));
  const [saving, setSaving] = useState(false);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!syllabus.name.trim()) errors.push("Subject name is required");
    
    syllabus.units.forEach((u, uIdx) => {
      if (!u.title.trim()) errors.push(`Unit ${uIdx + 1} has no title`);
      u.chapters.forEach((c, cIdx) => {
        if (!c.title.trim()) errors.push(`Chapter "${u.title}" - Chapter ${cIdx + 1} has no title`);
        c.topics?.forEach((t, tIdx) => {
          if (!t.trim()) errors.push(`Chapter "${c.title}" - Topic ${tIdx + 1} is empty`);
        });
      });
    });
    return errors;
  }, [syllabus]);

  const isValid = validationErrors.length === 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addUnit = () => {
    const newUnit: Unit = {
      id: `unit_${Date.now()}`,
      title: 'New Unit',
      chapters: []
    };
    setSyllabus({ ...syllabus, units: [...syllabus.units, newUnit] });
  };

  const removeUnit = (unitId: string) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.filter(u => u.id !== unitId)
    });
  };

  const handleDragEndUnits = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSyllabus((prev) => {
        const oldIndex = prev.units.findIndex((u) => u.id === active.id);
        const newIndex = prev.units.findIndex((u) => u.id === over?.id);
        return {
          ...prev,
          units: arrayMove(prev.units, oldIndex, newIndex),
        };
      });
    }
  };

  const updateUnitTitle = (unitId: string, title: string) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { ...u, title } : u)
    });
  };

  const addChapter = (unitId: string) => {
    const newChapter: Chapter = {
      id: `ch_${Date.now()}`,
      title: 'New Chapter',
      topics: []
    };
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { ...u, chapters: [...u.chapters, newChapter] } : u)
    });
  };

  const removeChapter = (unitId: string, chapterId: string) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { ...u, chapters: u.chapters.filter(c => c.id !== chapterId) } : u)
    });
  };

  const updateChapterTitle = (unitId: string, chapterId: string, title: string) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { 
        ...u, 
        chapters: u.chapters.map(c => c.id === chapterId ? { ...c, title } : c) 
      } : u)
    });
  };

  const addTopic = (unitId: string, chapterId: string) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { 
        ...u, 
        chapters: u.chapters.map(c => c.id === chapterId ? { 
          ...c, 
          topics: [...(c.topics || []), 'New Topic'] 
        } : c) 
      } : u)
    });
  };

  const removeTopic = (unitId: string, chapterId: string, topicIndex: number) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { 
        ...u, 
        chapters: u.chapters.map(c => c.id === chapterId ? { 
          ...c, 
          topics: (c.topics || []).filter((_, i) => i !== topicIndex) 
        } : c) 
      } : u)
    });
  };

  const updateTopic = (unitId: string, chapterId: string, topicIndex: number, value: string) => {
    setSyllabus({
      ...syllabus,
      units: syllabus.units.map(u => u.id === unitId ? { 
        ...u, 
        chapters: u.chapters.map(c => c.id === chapterId ? { 
          ...c, 
          topics: (c.topics || []).map((t, i) => i === topicIndex ? value : t) 
        } : c) 
      } : u)
    });
  };

  const handleSave = async () => {
    if (!auth.currentUser || !isValid) return;
    setSaving(true);
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/custom_syllabi`, syllabus.id);
      await setDoc(docRef, {
        ...syllabus,
        updatedAt: serverTimestamp()
      });
      onSave(syllabus);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div className="space-y-1">
          <EditableText 
            value={syllabus.name}
            onChange={val => setSyllabus({ ...syllabus, name: val })}
            className="text-2xl font-black text-[#141414] tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full"
            placeholder="Subject Name"
          />
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Customizing Syllabus Structure</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !isValid}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-indigo-100 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 bg-slate-50/20 space-y-8">
        {!isValid && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-black text-red-900 uppercase tracking-wider">Fix following errors to save:</p>
              <ul className="text-[11px] text-red-600 font-bold list-disc ml-4">
                {validationErrors.slice(0, 3).map((err, i) => <li key={i}>{err}</li>)}
                {validationErrors.length > 3 && <li>...and {validationErrors.length - 3} more errors</li>}
              </ul>
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndUnits}>
          <SortableContext items={syllabus.units.map(u => u.id)} strategy={verticalListSortingStrategy}>
            {syllabus.units.map((unit) => (
              <SortableUnit 
                key={unit.id}
                unit={unit}
                onUpdateTitle={(val) => updateUnitTitle(unit.id, val)}
                onRemove={() => removeUnit(unit.id)}
                onAddChapter={() => addChapter(unit.id)}
                onRemoveChapter={(chId) => removeChapter(unit.id, chId)}
                onUpdateChapterTitle={(chId, title) => updateChapterTitle(unit.id, chId, title)}
                onAddTopic={(chId) => addTopic(unit.id, chId)}
                onRemoveTopic={(chId, idx) => removeTopic(unit.id, chId, idx)}
                onUpdateTopic={(chId, idx, val) => updateTopic(unit.id, chId, idx, val)}
                onReorderChapters={(old, newVal) => {
                  setSyllabus(prev => ({
                    ...prev,
                    units: prev.units.map(u => u.id === unit.id ? { ...u, chapters: arrayMove(u.chapters, old, newVal) } : u)
                  }));
                }}
                onReorderTopics={(chId, old, newVal) => {
                  setSyllabus(prev => ({
                    ...prev,
                    units: prev.units.map(u => u.id === unit.id ? { 
                      ...u, 
                      chapters: u.chapters.map(c => c.id === chId ? { ...c, topics: arrayMove(c.topics || [], old, newVal) } : c)
                    } : u)
                  }));
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button 
          onClick={addUnit}
          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-sm font-black text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-4 bg-white shadow-sm"
        >
          <Plus className="w-5 h-5 shadow-inner p-1 rounded-full bg-slate-50" />
          Add Syllabus Unit
        </button>
      </div>
    </div>
  );
}
