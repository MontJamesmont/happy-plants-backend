const express = require('express')
const router = express.Router()
const Plant = require('../models/Plant')
const User = require('../models/User')
const ResponseError = require('../shared/responseError')
const generalValidation = require('../validation/general-validation')
const { getVerifyUserTokenSchema } = require('../validation/schemas/verifyUser')
const { createPlantSchema, getPlantSchema, deletePlantSchema, patchNameSchema } = require('../validation/schemas/plants')

// GET / - list plants for authenticated user
router.get('/', generalValidation, async (req, res, next) => {
  try {
    const auth = JSON.parse(req.header('authorization'))
    const user = auth ? auth.user : null
    if (!user) return next(new ResponseError('Unauthorised', 401, 'auth'))
    const plants = await Plant.find({ userId: user._id }).sort({ createdAt: -1 })
    return res.json({ success: true, result: plants })
  } catch (err) {
    console.log('Error listing plants.', err)
    return next(new ResponseError('Error listing plants.', 500, 'global'))
  }
})

// GET /:id - get single plant
router.get('/:id', getPlantSchema, generalValidation, async (req, res, next) => {
  try {
    const auth = JSON.parse(req.header('authorization'))
    const user = auth ? auth.user : null
    if (!user) return next(new ResponseError('Unauthorised', 401, 'auth'))
    const plant = await Plant.findById(req.params.id)
    if (!plant) return next(new ResponseError('Plant not found.', 404, 'global'))
    if (plant.userId.toString() !== user._id) return next(new ResponseError('Forbidden', 403, 'global'))
    return res.json({ success: true, result: plant })
  } catch (err) {
    console.log('Error fetching plant.', err)
    return next(new ResponseError('Error fetching plant.', 500, 'global'))
  }
})

// POST / - create plant
router.post('/', createPlantSchema, generalValidation, async (req, res, next) => {
  try {
    const auth = JSON.parse(req.header('authorization'))
    const user = auth ? auth.user : null
    if (!user) return next(new ResponseError('Unauthorised', 401, 'auth'))

    const newPlant = new Plant({
      perenualId: req.body.perenualId,
      userId: user._id,
      ownersPlantName: req.body.ownersPlantName,
      commonName: req.body.commonName,
      firstWateringDay: req.body.firstWateringDay,
      wateringIntervalDays: req.body.wateringIntervalDays,
      images: Array.isArray(req.body.images) ? req.body.images : []
    })

    const saved = await newPlant.save()

    // If User model has plants array, push the new plant id (this will be applied when User schema is updated)
    try {
      await User.updateOne({ _id: user._id }, { $addToSet: { plants: saved._id } }).catch(() => {})
    } catch (e) {}

    return res.status(201).json({ success: true, result: saved })
  } catch (err) {
    console.log('Error creating plant.', err)
    return next(new ResponseError('Error creating plant.', 500, 'global'))
  }
})

router.patch('/patchName', patchNameSchema, generalValidation, async (req, res, next) => {
  try {
    const auth = JSON.parse(req.header('authorization'))
    const user = auth ? auth.user : null
    if (!user) return next(new ResponseError('Unauthorised', 401, 'auth'))
    const plantId = req.body.id || req.body._id
    const newName = req.body.ownersPlantName
    if (!plantId || !newName) return next(new ResponseError('Missing id or ownersPlantName', 400, 'global'))

    const plant = await Plant.findById(plantId)
    if (!plant) return next(new ResponseError('Plant not found.', 404, 'global'))
    if (plant.userId.toString() !== user._id) return next(new ResponseError('Forbidden', 403, 'global'))

    plant.ownersPlantName = newName
    const saved = await plant.save()
    return res.json({ success: true, result: saved })
  } catch (err) {
    console.log('Error updating plant name.', err)
    return next(new ResponseError('Error updating plant name.', 500, 'global'))
  }
})

// DELETE /:id - remove plant
router.delete('/:id', deletePlantSchema, generalValidation, async (req, res, next) => {
  try {
    const auth = JSON.parse(req.header('authorization'))
    const user = auth ? auth.user : null
    if (!user) return next(new ResponseError('Unauthorised', 401, 'auth'))
    const plant = await Plant.findById(req.params.id)
    if (!plant) return next(new ResponseError('Plant not found.', 404, 'global'))
    if (plant.userId.toString() !== user._id) return next(new ResponseError('Forbidden', 403, 'global'))

    await Plant.deleteOne({ _id: plant._id })
    // remove from user's plants array if exists
    try {
      await User.updateOne({ _id: user._id }, { $pull: { plants: plant._id } }).catch(() => {})
    } catch (e) {}

    return res.json({ success: true })
  } catch (err) {
    console.log('Error deleting plant.', err)
    return next(new ResponseError('Error deleting plant.', 500, 'global'))
  }
})

module.exports = router
