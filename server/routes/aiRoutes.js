
import express from 'express'
import protect from '../middlewares/authMiddleware.js'

import {
  enhanceProfessionalSummary,
  enhanceJobDescription,
  uploadResume
} from '../controllers/aiController.js'

const aiRouter = express.Router()

// Professional Summary AI
aiRouter.post(
  '/enhance-professional-summary',
  protect,
  enhanceProfessionalSummary
)

// Job Description AI
aiRouter.post(
  '/enhance-job-description',
  protect,
  enhanceJobDescription
)

// Upload and extract resume data using AI
aiRouter.post(
  '/upload-resume',
  protect,
  uploadResume
)

// Keep old routes working
aiRouter.post(
  '/enchace-pro-sum',
  protect,
  enhanceProfessionalSummary
)

aiRouter.post(
  '/enchace-job-desc',
  protect,
  enhanceJobDescription
)

export default aiRouter
