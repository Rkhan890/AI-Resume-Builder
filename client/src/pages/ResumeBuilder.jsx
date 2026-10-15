import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, BriefcaseBusiness, Folder, GraduationCap, Sparkles, UserRound,
  FileText, ChevronLeft, ChevronRight, Share2, Eye, EyeOff, Download, Save, LoaderCircle
} from 'lucide-react';
import api from '../configs/api';
import PersonalInfoForm from '../components/PersonalInfoForm';
import ResumePreview from '../components/ResumePreview';
import TemplateSelector from '../components/TemplateSelector';
import ColorPicker from '../components/ColorPicker';
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm';
import ExperienceForm from '../components/ExprienceForm';
import EducationForm from '../components/EducationForm';
import ProjectForm from '../components/ProjectForm';
import SkillsForm from '../components/SkillsForm';

const emptyResume = {
  _id: '', title: '', personal_info: {}, professional_summary: '', experience: [],
  education: [], project: [], skills: [], template: 'classic', accent_color: '#3B82F6', public: false,
};

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const authToken = token || localStorage.getItem('token');
  const [resumeData, setResumeData] = useState(emptyResume);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: UserRound },
    { id: 'summary', name: 'Summary', icon: FileText },
    { id: 'experience', name: 'Experience', icon: BriefcaseBusiness },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'projects', name: 'Projects', icon: Folder },
    { id: 'skills', name: 'Skills', icon: Sparkles },
  ];
  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: authToken },
      });
      const loaded = data.resume;
      setResumeData({
        ...emptyResume,
        ...loaded,
        personal_info: loaded.personal_info || {},
        experience: loaded.experience || [],
        education: loaded.education || [],
        project: loaded.project || [],
        skills: loaded.skills || [],
      });
      document.title = `${loaded.title || 'Resume'} | Resume Builder`;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not load this resume');
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, authToken]);

  useEffect(() => { loadExistingResume(); }, [loadExistingResume]);

  const saveResume = async (draft = resumeData, showMessage = true) => {
    if (!authToken) {
      toast.error('Please log in again');
      return false;
    }
    setIsSaving(true);
    try {
      const safeDraft = { ...draft, personal_info: { ...(draft.personal_info || {}) } };
      const image = safeDraft.personal_info.image;
      let response;
      if (typeof File !== 'undefined' && image instanceof File) {
        const formData = new FormData();
        formData.append('resumeId', resumeId);
        formData.append('resumeData', JSON.stringify(safeDraft));
        formData.append('removeBackground', String(removeBackground));
        formData.append('image', image);
        response = await api.put('/api/resumes/update', formData, {
          headers: { Authorization: authToken },
        });
      } else {
        response = await api.put('/api/resumes/update', {
          resumeId,
          resumeData: safeDraft,
          removeBackground,
        }, { headers: { Authorization: authToken } });
      }
      if (response.data.resume) {
        setResumeData({ ...emptyResume, ...response.data.resume, personal_info: response.data.resume.personal_info || {} });
      } else {
        setResumeData(safeDraft);
      }
      if (showMessage) toast.success(response.data.message || 'Resume saved successfully');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not save resume');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    const next = { ...resumeData, public: !resumeData.public };
    const saved = await saveResume(next, false);
    if (saved) toast.success(next.public ? 'Resume is now public' : 'Resume is now private');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/view/${resumeId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: resumeData.title || 'My Resume', url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Public resume link copied');
      } else {
        window.prompt('Copy your public resume link:', shareUrl);
      }
    } catch (error) {
      if (error.name !== 'AbortError') toast.error('Could not share link');
    }
  };

  const handleDownload = () => window.print();

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin" /> Loading resume…</div>;
  }

  if (!resumeData._id) {
    return <div className="max-w-xl mx-auto p-8 text-center"><p className="text-slate-600 mb-4">Resume could not be found.</p><Link to="/app" className="text-green-700 underline">Back to dashboard</Link></div>;
  }

  return (
    <div className="resume-builder-page">
      <style>{`@media print { @page { size: A4; margin: 8mm; } body { background: white !important; } body * { visibility: hidden; } #resume-preview, #resume-preview * { visibility: visible; } #resume-preview { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important; box-shadow: none !important; } .resume-builder-page { display: block !important; } }`}</style>
      <div className="max-w-7xl mx-auto px-4 py-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/app" className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700"><ArrowLeft className="size-4" /> Back to Dashboard</Link>
          <h1 className="text-lg font-semibold text-slate-800 truncate max-w-[50vw]">{resumeData.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8 print:p-0 print:m-0">
        <div className="grid lg:grid-cols-12 gap-8 print:block">
          <section className="relative lg:col-span-5 rounded-lg print:hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sm:p-6">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2"><TemplateSelector selectedTemplate={resumeData.template} onChange={(template) => setResumeData((prev) => ({ ...prev, template }))} /><ColorPicker selectedcolor={resumeData.accent_color} onChange={(accent_color) => setResumeData((prev) => ({ ...prev, accent_color }))} /></div>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={activeSectionIndex === 0} onClick={() => setActiveSectionIndex((i) => Math.max(i - 1, 0))} className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft className="size-4" />Previous</button>
                  <button type="button" disabled={activeSectionIndex === sections.length - 1} onClick={() => setActiveSectionIndex((i) => Math.min(i + 1, sections.length - 1))} className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30">Next<ChevronRight className="size-4" /></button>
                </div>
              </div>

              <div className="flex gap-1 mb-5" aria-label="Resume sections">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return <button key={section.id} type="button" title={section.name} aria-label={section.name} onClick={() => setActiveSectionIndex(index)} className={`flex-1 rounded-md p-2 flex justify-center ${index === activeSectionIndex ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100'}`}><Icon className="size-4" /></button>;
                })}
              </div>
              <p className="text-xs text-slate-500 mb-4">Section {activeSectionIndex + 1} of {sections.length}: {activeSection.name}</p>

              {activeSection.id === 'personal' && <PersonalInfoForm data={resumeData.personal_info} onChange={(personal_info) => setResumeData((prev) => ({ ...prev, personal_info }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />}
              {activeSection.id === 'summary' && <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(professional_summary) => setResumeData((prev) => ({ ...prev, professional_summary }))} />}
              {activeSection.id === 'experience' && <ExperienceForm data={resumeData.experience} onChange={(experience) => setResumeData((prev) => ({ ...prev, experience }))} />}
              {activeSection.id === 'education' && <EducationForm data={resumeData.education} onChange={(education) => setResumeData((prev) => ({ ...prev, education }))} />}
              {activeSection.id === 'projects' && <ProjectForm data={resumeData.project} onChange={(project) => setResumeData((prev) => ({ ...prev, project }))} />}
              {activeSection.id === 'skills' && <SkillsForm data={resumeData.skills} onChange={(skills) => setResumeData((prev) => ({ ...prev, skills }))} />}

              <button type="button" onClick={() => saveResume()} disabled={isSaving} className="mt-6 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 hover:ring-green-400"><Save className="size-4" />{isSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </section>

          <section className="lg:col-span-7 max-lg:mt-2 print:m-0 print:p-0">
            <div className="flex items-center justify-end gap-2 flex-wrap mb-4 print:hidden">
              {resumeData.public && <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-xs text-blue-700 hover:bg-blue-200"><Share2 className="size-4" />Share</button>}
              <button type="button" onClick={handleTogglePublic} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-4 py-2 text-xs text-purple-700 hover:bg-purple-200 disabled:opacity-50">{resumeData.public ? <Eye className="size-4" /> : <EyeOff className="size-4" />}{resumeData.public ? 'Make Private' : 'Make Public'}</button>
              <button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-xs text-green-700 hover:bg-green-200"><Download className="size-4" />Download PDF</button>
            </div>
            <div className="resume-preview-wrapper rounded-lg border border-gray-200 bg-white p-2 sm:p-4 shadow-sm print:border-0 print:p-0 print:shadow-none">
              <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} classes="mx-auto" />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right print:hidden">Use “Download PDF” and choose “Save as PDF” in the print dialog.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
