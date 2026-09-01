const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PlantSchema = new Schema({
  perenualId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownersPlantName: { type: String, required: true },
  commonName: { type: String },
  firstWateringDay: { type: Date, required: true },
  wateringIntervalDays: { type: Number, required: true },
  images: [{ type: String }]
}, { timestamps: true })

module.exports = mongoose.model('Plant', PlantSchema)
