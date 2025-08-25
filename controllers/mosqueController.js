const Contributor = require('../models/contributor');
const Mosque = require('../models/mosque');

// ✅ Distance function
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

// ✅ Add new mosque – only for logged-in contributors
 exports.addMosque = async (req, res) => {
  try {
    const { name, address, city, area, location, prayerTimes, amenities, photos } = req.body;

    // Extract coordinates
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    const [longitude, latitude] = location.coordinates;

    // Check nearby mosque (1km = 1000 meters)
    const existingMosque = await Mosque.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 1000
        }
      }
    });

    if (existingMosque) {
      return res.status(400).json({ message: "Another mosque already exists within 1 km" });
    }

    // Save new mosque
    const mosque = new Mosque({
      name,
      address,
      city,
      area,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      prayerTimes,
      amenities,
      photos
    });

    await mosque.save();
    res.status(201).json({ message: "Mosque added successfully", mosque });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add mosque", error: error.message });
  }
};





exports.updateMosque=async (req, res)=>{
try{
    const mosqueId = req.params.id;
    const updateData = req.body;

    const mosque = await Mosque.findByIdAndUpdate(mosqueId, updateData, {
      new: true,
    });


  if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found or not yours' });
    }
    res.json({ message: 'Mosque updated', mosque });
    }catch(err){
console.error("❌ Update error:", err);
    res.status(500).json({ message: 'Update failed', error: err.message });
}

}
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
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

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
          $maxDistance: parseInt(radius)
        }
      }
      // verified: true  // <-- remove for now to debug
    });

    res.json(mosques);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch nearby mosques', error });
  }
};


