import React, { useCallback, useEffect, useState } from 'react';
import { FilePenLine, Pencil, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import pdftotext from 'react-pdftotext';
import api from '../configs/api';

const colors = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a'];

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const authToken = token || localStorage.getItem('token');

  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = { Authorization: authToken };

  const loadAllResumes = useCallback(async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/api/user/resumes', { headers: authHeaders });
      setAllResumes(Array.isArray(data.resumes) ? data.resumes : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not load your resumes');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const createResume = async (event) => {
    event.preventDefault();
    if (!title.trim()) return toast.error('Enter a resume title');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/api/resumes/create', { title: title.trim() }, { headers: authHeaders });
      if (!data.resume?._id) throw new Error('The server did not return the new resume ID');
      setAllResumes((prev) => [data.resume, ...prev]);
      setTitle('');
      setShowCreateResume(false);
      toast.success('Resume created');
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Could not create resume');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    if (!title.trim() || !resumeFile) return toast.error('Enter a title and choose a PDF file');
    if (resumeFile.type !== 'application/pdf' && !resumeFile.name.toLowerCase().endsWith('.pdf')) {
      return toast.error('Please choose a PDF file');
    }
    setIsSubmitting(true);
    try {
      const resumeText = await pdftotext(resumeFile);
      if (!resumeText?.trim()) throw new Error('Could not read text from this PDF. Try a text-based PDF.');
      const { data } = await api.post('/api/ai/upload-resume', { title: title.trim(), resumeText }, { headers: authHeaders });
      setTitle('');
      setResumeFile(null);
      setShowUploadResume(false);
      toast.success(data.message || 'Resume imported');
      await loadAllResumes();
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Could not import PDF');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editTitle = async (event) => {
    event.preventDefault();
    if (!title.trim()) return toast.error('Enter a resume title');
    setIsSubmitting(true);
    try {
      const { data } = await api.put('/api/resumes/update', {
        resumeId: editResumeId,
        resumeData: { title: title.trim() },
      }, { headers: authHeaders });
      setAllResumes((prev) => prev.map((item) => item._id === editResumeId ? (data.resume || { ...item, title: title.trim() }) : item));
      setTitle('');
      setEditResumeId('');
      toast.success(data.message || 'Resume title updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not update resume title');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this resume?')) return;
    try {
      const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers: authHeaders });
      setAllResumes((prev) => prev.filter((item) => item._id !== resumeId));
      toast.success(data.message || 'Resume deleted');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not delete resume');
    }
  };

  useEffect(() => { loadAllResumes(); }, [loadAllResumes]);

  const closeCreate = () => { setShowCreateResume(false); setTitle(''); };
  const closeUpload = () => { setShowUploadResume(false); setTitle(''); setResumeFile(null); };
  const closeEdit = () => { setEditResumeId(''); setTitle(''); };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Welcome, {user?.name || 'there'}</h1>
          <p className="text-sm text-slate-500 mt-1">Create, edit and manage your resumes.</p>
        </div>
        <p className="text-sm text-slate-500">{allResumes.length} {allResumes.length === 1 ? 'resume' : 'resumes'}</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={() => { setTitle(''); setShowCreateResume(true); }} className="w-full sm:w-36 h-44 bg-white flex flex-col items-center justify-center rounded-xl gap-3 text-slate-600 border border-dashed border-slate-300 hover:border-indigo-500 hover:shadow-lg transition-all">
          <Plus className="size-12 p-3 bg-gradient-to-r from-indigo-300 to-indigo-500 text-white rounded-full" />
          <span className="text-sm">Create Resume</span>
        </button>
        <button type="button" onClick={() => { setTitle(''); setResumeFile(null); setShowUploadResume(true); }} className="w-full sm:w-36 h-44 bg-white flex flex-col items-center justify-center rounded-xl gap-3 text-slate-600 border border-dashed border-slate-300 hover:border-purple-500 hover:shadow-lg transition-all">
          <UploadCloud className="size-12 p-3 bg-gradient-to-r from-purple-300 to-purple-500 text-white rounded-full" />
          <span className="text-sm">Upload Existing</span>
        </button>
      </div>

      <hr className="border-slate-200 my-7" />

      {isLoading ? <p className="py-8 text-center text-slate-500">Loading your resumes…</p> : allResumes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FilePenLine className="size-10 mx-auto text-slate-300 mb-3" />
          <h2 className="font-medium text-slate-700">No resumes yet</h2>
          <p className="text-sm text-slate-500 mt-1">Create your first resume to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allResumes.map((item, index) => {
            const color = colors[index % colors.length];
            return (
              <article key={item._id} className="relative min-h-48 rounded-xl border p-3 group hover:shadow-md transition-shadow" style={{ background: `linear-gradient(135deg, ${color}08, ${color}22)`, borderColor: `${color}50` }}>
                <button type="button" onClick={() => navigate(`/app/builder/${item._id}`)} className="w-full min-h-36 flex flex-col items-center justify-center gap-3 px-2 pb-5">
                  <FilePenLine className="size-8" style={{ color }} />
                  <span className="text-sm font-medium text-center break-words" style={{ color }}>{item.title || 'Untitled Resume'}</span>
                  <span className="absolute bottom-2 left-2 right-2 text-[11px] text-center text-slate-500">Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'recently'}</span>
                </button>
                <div className="absolute right-2 top-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button type="button" title="Edit title" aria-label={`Edit ${item.title}`} onClick={() => { setEditResumeId(item._id); setTitle(item.title || ''); }} className="rounded-md bg-white/90 p-2 text-slate-700 hover:text-indigo-600 shadow-sm"><Pencil className="size-4" /></button>
                  <button type="button" title="Delete resume" aria-label={`Delete ${item.title}`} onClick={() => deleteResume(item._id)} className="rounded-md bg-white/90 p-2 text-slate-700 hover:text-red-600 shadow-sm"><Trash2 className="size-4" /></button>
                </div>
                {item.public && <span className="absolute left-2 top-2 rounded bg-green-100 px-2 py-0.5 text-[10px] text-green-700">Public</span>}
              </article>
            );
          })}
        </div>
      )}

      {showCreateResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) closeCreate(); }}>
          <form onSubmit={createResume} className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <button type="button" aria-label="Close" onClick={closeCreate} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Create a resume</h2>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer Resume" maxLength={100} className="w-full rounded-lg border border-slate-300 px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-500" required />
            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-60">{isSubmitting ? 'Creating…' : 'Create Resume'}</button>
          </form>
        </div>
      )}

      {showUploadResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) closeUpload(); }}>
          <form onSubmit={uploadResume} className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <button type="button" aria-label="Close" onClick={closeUpload} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Import an existing PDF</h2>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume title" maxLength={100} className="w-full rounded-lg border border-slate-300 px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-500" required />
            <label htmlFor="resume-pdf" className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-center text-slate-500 hover:border-green-500">
              <UploadCloud className="size-8" />
              <span className="text-sm">{resumeFile ? resumeFile.name : 'Choose a text-based PDF'}</span>
            </label>
            <input id="resume-pdf" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-slate-500 mt-2 mb-4">AI will extract the details. Scanned PDFs may not contain readable text.</p>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-60">{isSubmitting ? 'Importing with AI…' : 'Import Resume'}</button>
          </form>
        </div>
      )}

      {editResumeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) closeEdit(); }}>
          <form onSubmit={editTitle} className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <button type="button" aria-label="Close" onClick={closeEdit} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X /></button>
            <h2 className="text-xl font-semibold mb-4">Edit resume title</h2>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Resume title" className="w-full rounded-lg border border-slate-300 px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-500" required />
            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-60">{isSubmitting ? 'Saving…' : 'Save title'}</button>
          </form>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
