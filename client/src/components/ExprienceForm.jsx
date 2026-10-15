import React, { useState } from 'react';
import { Plus, Trash2, Briefcase, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../configs/api';

const ExperienceForm = ({ data = [], onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [enhancingIndex, setEnhancingIndex] = useState(-1);

  const addExperience = () => onChange([...data, { company: '', position: '', start_date: '', end_date: '', description: '', is_current: false }]);
  const removeExperience = (index) => onChange(data.filter((_, i) => i !== index));
  const updateExperience = (index, field, value) => onChange(data.map((item, i) => i === index ? { ...item, [field]: value } : item));

  const enhanceDescription = async (index) => {
    const description = data[index]?.description?.trim();
    if (!description) return toast.error('Write a job description first');
    setEnhancingIndex(index);
    try {
      const { data: response } = await api.post('/api/ai/enhance-job-description', { userContent: description }, { headers: { Authorization: token || localStorage.getItem('token') } });
      if (!response.enhancedContent) throw new Error('AI returned no enhanced description');
      updateExperience(index, 'description', response.enhancedContent);
      toast.success('Job description enhanced');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'AI enhancement failed');
    } finally {
      setEnhancingIndex(-1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-gray-900">Professional Experience</h3><p className="text-sm text-gray-500">Add your work experience.</p></div><button type="button" onClick={addExperience} className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"><Plus className="size-4" />Add</button></div>
      {data.length === 0 ? <div className="text-center py-8 text-gray-500"><Briefcase className="size-10 mx-auto mb-3 text-gray-300" /><p>No work experience added yet.</p><p className="text-sm">Click Add to get started.</p></div> : data.map((experience, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex justify-between items-center"><h4 className="font-medium">Experience #{index + 1}</h4><button type="button" onClick={() => removeExperience(index)} aria-label="Remove experience" className="text-red-500 hover:text-red-700"><Trash2 className="size-4" /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={experience.company || ''} onChange={(e) => updateExperience(index, 'company', e.target.value)} placeholder="Company name" className="px-3 py-2 text-sm rounded-lg border border-gray-300" />
            <input value={experience.position || ''} onChange={(e) => updateExperience(index, 'position', e.target.value)} placeholder="Job title" className="px-3 py-2 text-sm rounded-lg border border-gray-300" />
            <label className="text-xs text-slate-500">Start date<input value={experience.start_date || ''} onChange={(e) => updateExperience(index, 'start_date', e.target.value)} type="month" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-300" /></label>
            <label className="text-xs text-slate-500">End date<input value={experience.end_date || ''} onChange={(e) => updateExperience(index, 'end_date', e.target.value)} type="month" disabled={experience.is_current} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:bg-gray-100" /></label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={!!experience.is_current} onChange={(e) => updateExperience(index, 'is_current', e.target.checked)} />I currently work here</label>
          <div className="space-y-2"><div className="flex items-center justify-between gap-2"><label className="text-sm font-medium text-gray-700">Job description</label><button type="button" onClick={() => enhanceDescription(index)} disabled={enhancingIndex === index} className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"><Sparkles className="size-3" />{enhancingIndex === index ? 'Enhancing…' : 'Enhance with AI'}</button></div><textarea value={experience.description || ''} onChange={(e) => updateExperience(index, 'description', e.target.value)} rows={4} maxLength={4000} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 resize-y" placeholder="Describe responsibilities and achievements…" /></div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceForm;
