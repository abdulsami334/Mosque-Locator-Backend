const mongoose = require('mongoose');

const mosqueSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  area: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  prayerTimes: {
    fajr: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
    jummah: String,
  },
  amenities: {
    wudu: Boolean,
    womenArea: Boolean,
    parking: Boolean,
    toilet: Boolean,
    wheelchair: Boolean,
    ac: Boolean,
  },
  photos: [String],
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contributor' },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

// ✅ Create 2dsphere index for location-based queries
mosqueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('MosqueInfo', mosqueSchema);
