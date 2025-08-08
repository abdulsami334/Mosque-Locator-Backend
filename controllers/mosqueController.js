const Contributor = require('../models/contributor');
const Mosque = require('../models/mosque');

// ✅ Add new mosque – only for logged-in contributors
exports.addMosque = async (req, res) => {
  try {
    const mosque = await Mosque.create({
      ...req.body,
      contributorId: req.user.id,   // Logged-in user
      verified: false
    });
    res.status(201).json(mosque);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add mosque', error });
  }
};

// ✅ Public API – anyone can see all mosques and their timings
exports.getAllMosques = async (req, res) => {
  try {
    const mosques = await Mosque.find()
    //.select('name city area timings'); // show selected fields
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mosques', error });
  }
};

// ✅ Contributor-only – get all mosques added by logged-in contributor
exports.getMyMosques = async (req, res) => {
  try {
    const mosques = await Mosque.find({ contributorId: req.user.id });
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your mosques', error });
  }
};

// ✅ Find mosques near user's location
exports.getNearbyMosques = async (req, res) => {
  try {
    const { lat, lng, radius = 500 } = req.query; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const mosques = await Mosque.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) // e.g. 500 meters = 5km
        }
      },
      verified: true // optional: only show verified ones
    });

    res.json(mosques);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch nearby mosques', error });
  }
};

