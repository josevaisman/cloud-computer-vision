'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model-datastore-prediction')
const modelObject = require('../objects/model-datastore-object')

const oauth2 = require('../../utils/oauth2')

const router = express.Router()

// Expose login/logout URLs to templates.
router.use(oauth2.template);

// Automatically parse request body as JSON
router.use(bodyParser.json())

router.use(oauth2.router)

/**
 * GET /api/predictions
 *
 * Retrieve a page of predictions (up to ten at a time).
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
 * POST /api/predictions
 *
 * Create a new prediction.
 */
router.post('/', oauth2.required, (req, res, next) => {
  model.create(req.body, (err, entity) => {
    if (err) {
      next(err)
      return
    }
    res.json(entity)
  })
})

/**
 * GET /api/predictions/:id
 *
 * Retrieve a prediction.
 */
router.get('/:prediction', (req, res, next) => {
  model.read(req.params.prediction, (err, entity) => {
    if (err) {
      next(err)
      return
    }
    res.json(entity)
  })
})

/**
 * GET /api/predictions/:id/objects/
 *
 * Retrieve a prediction.
 */

const readObject = (id) => new Promise((resolve,reject) => modelObject.read(id, (err, entity) => {
  if(err) {
    reject(err)
    return;
  }
  resolve(entity)
}))

router.get('/:prediction/objects', (req, res, next) => {
  model.read(req.params.prediction, (err, entity) => {
    if (err) {
      next(err)
      return
    }
    Promise.all(entity.objects.map(objectId => readObject(objectId)))
    .then(objectEntities => {
      entity.objectEntities = objectEntities
      res.json(entity)
    })
  })
})

/**
 * PUT /api/predictions/:id
 *
 * Update a prediction.
 */
router.put('/:prediction', oauth2.required, (req, res, next) => {
  model.update(req.params.prediction, req.body, (err, entity) => {
    if (err) {
      next(err)
      return
    }
    res.json(entity)
  })
})

/**
 * DELETE /api/predictions/:id
 *
 * Delete a prediction.
 */
router.delete('/:prediction', oauth2.required, (req, res, next) => {
  model.delete(req.params.prediction, err => {
    if (err) {
      next(err)
      return
    }
    res.status(200).send('OK')
  })
})

/**
 * Errors on "/api/predictions/*" routes.
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
