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
    const mosques = await Mosque.find().select('name city area timings'); // show selected fields
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
