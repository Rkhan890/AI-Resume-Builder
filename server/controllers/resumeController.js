import fs from 'node:fs';
import imagekit from '../configs/imagekit.js';
import Resume from '../models/Resume.js';

export const createResume = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Resume title is required' });
    const resume = await Resume.create({ userId: req.userId, title });
    return res.status(201).json({ message: 'Resume created successfully', resume });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not create resume' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.resumeId, userId: req.userId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.userId }).lean();
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getPublicResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, public: true }).lean();
    if (!resume) return res.status(404).json({ message: 'This resume is private or does not exist' });
    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateResume = async (req, res) => {
  let uploadedPath;
  try {
    const { resumeId, removeBackground } = req.body;
    if (!resumeId) return res.status(400).json({ message: 'Resume ID is required' });

    let resumeData = req.body.resumeData;
    if (typeof resumeData === 'string') resumeData = JSON.parse(resumeData);
    if (!resumeData || typeof resumeData !== 'object') {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    // Only allow known resume fields to be updated.
    const allowedFields = ['title', 'public', 'template', 'accent_color', 'professional_summary', 'skills', 'personal_info', 'experience', 'education', 'project'];
    const update = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(resumeData, field)) update[field] = resumeData[field];
    }

    if (req.file) {
      uploadedPath = req.file.path;
      if (!imagekit) return res.status(503).json({ message: 'Image upload is not configured. Add IMAGEKIT_PRIVATE_KEY to server/.env' });
      const imageBufferData = fs.createReadStream(req.file.path);
      const imageResponse = await imagekit.files.upload({
        file: imageBufferData,
        fileName: `resume-${resumeId}-${Date.now()}.jpg`,
        folder: 'user-resume',
        transformation: {
          pre: `w-300,h-300,fo-face,z-0.75${removeBackground === 'true' || removeBackground === true ? ',e-bgremove' : ''}`
        }
      });
      const personalInfo = update.personal_info || {};
      delete update.personal_info;
      for (const [key, value] of Object.entries(personalInfo)) {
        if (key !== 'image') update[`personal_info.${key}`] = value;
      }
      update['personal_info.image'] = imageResponse.url;
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId: req.userId },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.status(200).json({ message: 'Resume saved successfully', resume });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Could not save resume' });
  } finally {
    if (uploadedPath) fs.promises.unlink(uploadedPath).catch(() => {});
  }
};
