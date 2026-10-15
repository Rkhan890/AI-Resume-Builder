import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../configs/api';

const ProfessionalSummaryForm = ({ data, onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceSummary = async () => {
    if (!data?.trim()) return toast.error('Write your summary first, then use AI Enhance');
    setIsEnhancing(true);
    try {
      const { data: response } = await api.post('/api/ai/enhance-professional-summary', { userContent: data }, { headers: { Authorization: token || localStorage.getItem('token') } });
      if (!response.enhancedContent) throw new Error('AI returned no enhanced summary');
      onChange(response.enhancedContent);
      toast.success('Summary enhanced');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'AI enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3><p className="text-sm text-gray-500">Summarize your strengths and career goals.</p></div>
        <button type="button" onClick={enhanceSummary} disabled={isEnhancing} className="shrink-0 flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"><Sparkles className="size-4" />{isEnhancing ?  'Enhancing…' : 'AI Enhance'}
        </button>
      </div>
      <textarea value={data || ''} onChange={(e) => onChange(e.target.value)} rows={7} maxLength={3000} className="w-full p-3 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 outline-none resize-y" placeholder="Write a compelling professional summary highlighting your skills, experience and career objectives…" />
      <p className="text-xs text-gray-500 text-center">AI suggestions should be reviewed for accuracy before saving.</p>
    </div>
  );
};

export default ProfessionalSummaryForm;
