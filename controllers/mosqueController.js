const Contributor = require('../models/contributor');
const Mosque = require('../models/mosque');
const Notification = require('../models/notification'); // ✅ add notification

// ✅ Add new mosque – only for logged-in contributors
// ✅ Add new mosque – only for logged-in contributors
exports.addMosque = async (req, res) => {
  try {
    const { name, address, city, area, location, prayerTimes, amenities, photos } = req.body;

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    const [longitude, latitude] = location.coordinates;

    // Check nearby mosque (1km)
    const existingMosque = await Mosque.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 1000
        }
      }
    });

    if (existingMosque) {
      // Only reject if it's the exact same mosque name
      if (existingMosque.name.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({ message: "This mosque already exists within 1 km" });
      }
      // Allow different mosque names within 1km
      // You might want to add a warning message here if needed
    }

    // Save new mosque
    const mosque = new Mosque({
      name,
      address,
      city,
      area,
      location: { type: "Point", coordinates: [longitude, latitude] },
      prayerTimes,
      amenities,
      photos,
      contributorId: req.user.id, // ✅ link to contributor
      approved: false,            // default not approved
      verified: false
    });

    await mosque.save();

    // ✅ notification
    await Notification.create({
        userId: String(req.user.id),
      message: "Mosque request submitted for approval",
      status: "unread"
    });

    res.status(201).json({ message: "Mosque added successfully", mosque });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add mosque", error: error.message });
  }
};

// ✅ Update mosque (only by contributor who added it)
// exports.updateMosque = async (req, res) => {
//   try {
//     const mosqueId = req.params.id;
//     const updateData = req.body;

//     const mosque = await Mosque.findOneAndUpdate(
//       { _id: mosqueId, contributorId: req.user.id }, // ✅ ensure ownership
//       updateData,
//       { new: true }
//     );

//     if (!mosque) {
//       return res.status(404).json({ message: "Mosque not found or not yours" });
//     }

//     res.json({ message: "Mosque updated", mosque });
//   } catch (err) {
//     console.error("❌ Update error:", err);
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// };


exports.updateMosque = async (req, res) => {
  try {
    const mosqueId = req.params.id;
    const updateData = req.body;

    // ✅ mosque find karo
    const mosque = await Mosque.findById(mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: "Mosque not found" });
    }

    // ✅ mosque update karo
    Object.assign(mosque, updateData);
    await mosque.save();

    // ✅ notification create karo (original contributor ko milega)
    if (mosque.contributorId) {
      await Notification.create({
        userId: mosque.contributorId,   // jisne mosque banayi thi
        message: `🕌 Your mosque "${mosque.name}" has been edited by another user.`,
        status: "unread"
      });
    }

    res.json({ message: "Mosque updated", mosque });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Public API – anyone can see all mosques
exports.getAllMosques = async (req, res) => {
  try {
    const mosques = await Mosque.find({ approved: true });
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch mosques", error });
  }
};

// ✅ Contributor-only – get all mosques added by logged-in contributor
exports.getMyMosques = async (req, res) => {
  try {
    const mosques = await Mosque.find({ contributorId: req.user.id });
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your mosques", error });
  }
};

// ✅ Find mosques near user's location
// exports.getNearbyMosques = async (req, res) => {
//   try {
//     const { lat, lng, radius = 5000 } = req.query;
//     if (!lat || !lng) {
//       return res.status(400).json({ message: "Latitude and longitude are required" });
//     }

//     const mosques = await Mosque.find({
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
//           $maxDistance: parseInt(radius)
//         }
//       },
//       approved: true
//     });

//     res.json(mosques);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch nearby mosques", error });
//   }
// };


// ✅ Find mosques near user's location
 exports.getNearbyMosques = async (req, res) => { try { const { lat, lng, radius = 5000 } = req.query;  if (!lat || !lng) { return res.status(400).json({ message: 'Latitude and longitude are required' }); } const mosques = await Mosque.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(radius) } } }); res.json(mosques); } catch (error) { console.error(error); res.status(500).json({ message: 'Failed to fetch nearby mosques', error }); } };

// ✅ Admin review (approve/reject mosque)
exports.reviewMosque = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const mosque = await Mosque.findById(id);
    if (!mosque) return res.status(404).json({ message: "Mosque not found" });
    if (mosque.approved) return res.status(400).json({ message: "Already processed" });

    if (action === "approve") {
      mosque.approved = true;
      mosque.verified = true;
      await mosque.save();

      // ✅ Approved notification
      await Notification.create({
         userId: String(mosque.contributorId),
        message: "Your mosque has been approved. Now you can edit it.",
        status: "approved"
      });

      return res.json({ message: "Mosque approved", mosque });
    }

    await Mosque.findByIdAndDelete(id);

    // ✅ Rejected notification
    await Notification.findByIdAndUpdate({
      userId: String(mosque.contributorId),
      message: "Your mosque request was rejected.",
      status: "rejected"
    });

    res.json({ message: "Mosque rejected and removed" });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};
