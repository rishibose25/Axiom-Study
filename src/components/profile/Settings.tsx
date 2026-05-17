import React, { useState, useEffect } from 'react';
import { 
  User, 
  School, 
  Target, 
  Layers, 
  Save, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useProfile } from '../../hooks/useProfile';

export function Settings() {
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    school: '',
    ikigai: '',
    syllabusStream: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        age: profile.age?.toString() || '',
        school: profile.school || '',
        ikigai: profile.ikigai || '',
        syllabusStream: profile.syllabusStream || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        displayName: formData.displayName,
        age: parseInt(formData.age) || undefined,
        school: formData.school,
        ikigai: formData.ikigai,
        syllabusStream: formData.syllabusStream,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-8">
        <div className="h-10 bg-slate-100 rounded-lg w-1/4" />
        <div className="h-64 bg-slate-50 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-[#141414]">Settings</h2>
        <p className="text-[#8E9299] text-[13px] font-bold uppercase tracking-widest mt-1">Manage your academic identity & profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
             <h3 className="text-lg font-black text-[#141414] flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Personal Information
             </h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Full Name</label>
               <input 
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={formData.displayName}
                 onChange={e => setFormData({...formData, displayName: e.target.value})}
                 placeholder="e.g. Rishi Bose"
                 required
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Age / Date of Birth</label>
               <input 
                 type="number"
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={formData.age}
                 onChange={e => setFormData({...formData, age: e.target.value})}
                 placeholder="e.g. 17"
               />
            </div>

            <div className="space-y-2 md:col-span-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">School / Coaching Institute</label>
               <div className="relative">
                 <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <input 
                   className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                   value={formData.school}
                   onChange={e => setFormData({...formData, school: e.target.value})}
                   placeholder="e.g. Radiant Public School"
                 />
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
             <h3 className="text-lg font-black text-[#141414] flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                Academic Goals
             </h3>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Syllabus Stream</label>
               <div className="relative">
                 <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <select 
                   className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                   value={formData.syllabusStream}
                   onChange={e => setFormData({...formData, syllabusStream: e.target.value})}
                 >
                   <option value="">Select Stream</option>
                   <option value="NEET">NEET (UG)</option>
                   <option value="JEE">JEE (Mains/Advanced)</option>
                   <option value="CBSE">CBSE Board</option>
                   <option value="ICSE">ICSE / ISC</option>
                   <option value="STATE">State Board</option>
                   <option value="OTHER">Other</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">Ikigai (Your Goal Statement)</label>
               <textarea 
                 className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none"
                 value={formData.ikigai}
                 onChange={e => setFormData({...formData, ikigai: e.target.value})}
                 placeholder="Describe your ultimate academic and life goal..."
               />
               <p className="text-[10px] text-slate-400 font-medium">This statement fuels your AI tutor's motivation and personalizes your study plan.</p>
            </div>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm border",
              message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
