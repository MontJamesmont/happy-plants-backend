const { body, param } = require('express-validator')

const createPlantSchema = [
  body('perenualId')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({ msg: 'Is required', errorCode: 'is_required' }),
  body('ownersPlantName')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({ msg: 'Is required', errorCode: 'is_required' }),
  body('commonName').optional(),
  body('firstWateringDay')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({ msg: 'Is required', errorCode: 'is_required' })
    .isISO8601()
    .withMessage({ msg: 'Invalid date', errorCode: 'invalid_date' }),
  body('wateringIntervalDaysValue')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage({ msg: 'Invalid number', errorCode: 'invalid_number' }),
  body('wateringIntervalDaysUnit')
    .optional({ nullable: true }),
  body('images').optional().isArray().withMessage({ msg: 'Images must be an array', errorCode: 'invalid_images' })
]

const getPlantSchema = [
  param('id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({ msg: 'Is required', errorCode: 'is_required' })
    .isMongoId()
    .withMessage({ msg: 'Invalid id', errorCode: 'invalid_id' })
]

const deletePlantSchema = getPlantSchema

const patchNameSchema = [
  body('id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({ msg: 'Is required', errorCode: 'is_required' })
    .isMongoId()
    .withMessage({ msg: 'Invalid id', errorCode: 'invalid_id' }),
  body('ownersPlantName')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({ msg: 'Is required', errorCode: 'is_required' })
]

module.exports = {
  createPlantSchema,
  getPlantSchema,
  deletePlantSchema,
  patchNameSchema
}
