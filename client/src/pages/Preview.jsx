import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, LoaderCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../configs/api';
import ResumePreview from '../components/ResumePreview';

const Preview = () => {
  const { resumeId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    let active = true;
    const loadResume = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/api/resumes/public/${resumeId}`);
        if (active) setResumeData(data.resume || null);
      } catch (error) {
        if (active) {
          setResumeData(null);
          toast.error(error?.response?.data?.message || 'Could not load this public resume');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadResume();
    return () => { active = false; };
  }, [resumeId]);

  if (isLoading) return <div className="flex items-center justify-center h-screen gap-3 text-slate-500"><LoaderCircle className="size-8 animate-spin" />Loading resume…</div>;

  if (!resumeData) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4"><p className="text-center text-2xl text-slate-500 font-medium">Resume not found or it is private.</p><Link to="/" className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3"><ArrowLeft className="size-4" />Go to home page</Link></div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 sm:px-6 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center gap-3 mb-4 print:hidden">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><ArrowLeft className="size-4" />Back</Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"><Download className="size-4" />Download PDF</button>
        </div>
        <div className="bg-white shadow-sm rounded-lg print:shadow-none print:rounded-none">
          <ResumePreview data={resumeData} template={resumeData.template || 'classic'} accentColor={resumeData.accent_color || '#3B82F6'} classes="mx-auto" />
        </div>
      </div>
    </main>
  );
};

export default Preview;
