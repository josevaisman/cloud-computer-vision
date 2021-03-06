'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model-datastore-video')
const { sendUploadToGCS, multer } = require('../../utils/images')

const oauth2 = require('../../utils/oauth2')

const router = express.Router()

// Expose login/logout URLs to templates.
router.use(oauth2.template);

// Automatically parse request body as JSON
router.use(bodyParser.json())

router.use(oauth2.router)

/**
 * GET /api/videos
 *
 * Retrieve a page of videos (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  model.list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err)
      return
    }
    res.json({
      items: entities,
      nextPageToken: cursor
    })
  })
})

/**
 * POST /api/videos
 *
 * Create a new video.
 */
router.post(
  '/',
  oauth2.required,
  multer.single('file'),
  sendUploadToGCS,
  async (req, res, next) => {
    const data = { imageUrl: req.file.cloudStoragePublicUrl, predictions: null, frames: null } // Predictions represents the object detected in the media
    model.create(data, (err, entity) => {
      if (err) {
        next(err)
        return
      }
      res.json(entity)
    })
  })

/**
 * GET /api/videos/:id
 *
 * Retrieve a video.
 */
router.get('/:video', (req, res, next) => {
  model.read(req.params.video, (err, entity) => {
    if (err) {
      next(err)
      return
    }
    res.json(entity)
  })
})

/**
 * PUT /api/videos/:id
 *
 * Update a video.
 */
router.put('/:video', oauth2.required, (req, res, next) => {
  model.update(req.params.video, req.body, (err, entity) => {
    if (err) {
      next(err)
      return
    }
    res.json(entity)
  })
})

/**
 * DELETE /api/videos/:id
 *
 * Delete a video.
 */
router.delete('/:video', oauth2.required, (req, res, next) => {
  model.delete(req.params.video, err => {
    if (err) {
      next(err)
      return
    }
    res.status(200).send('OK')
  })
})

/**
 * Errors on "/api/videos/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = {
    message: err.message,
    internalCode: err.code
  }
  next(err)
})

module.exports = router
