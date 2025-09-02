const Contributor = require('../models/contributor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// 🔹 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, city, area, reason } = req.body;

    // ✅ check already registered
    const existing = await Contributor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    // ✅ password hash
    const hash = await bcrypt.hash(password, 10);

    // ✅ save contributor (approved:false by default)
    const contributor = await Contributor.create({
      name,
      email,
      password: hash,
      phone,
      city,
      area,
      reason,
      approved: false,
    });

    res.status(201).json({
      message: "Registration submitted. Wait for approval.",
      contributor: { id: contributor._id, email: contributor.email }
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const contributor = await Contributor.findOne({ email });
    if (!contributor) {
      return res.status(401).json({ message: "Contributor not found" });
    }

    if (!contributor.approved) {
      return res.status(403).json({ message: "Your account is not approved yet" });
    }

    // ✅ password check
    const isMatch = await bcrypt.compare(password, contributor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // ✅ generate token
    const token = jwt.sign({ id: contributor._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      contributor: {
        id: contributor._id,
        name: contributor.name,
        email: contributor.email,
        phone: contributor.phone,
        city: contributor.city,
        area: contributor.area,
        reason: contributor.reason,
        approved: contributor.approved,
        imageUrl: contributor.imageUrl || null,
        isContributor: true,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- UPDATE PROFILE PICTURE ----------------
exports.updateProfilePicture = async (req, res) => {
  try {
    const contributorId = req.user.id; // ✅ from auth middleware
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // ✅ upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      folder: "mosque_locator/profile_pics",
    });

    // ✅ remove local file (temp)
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // ✅ update DB
    const contributor = await Contributor.findByIdAndUpdate(
      contributorId,
      { imageUrl: uploadRes.secure_url },
      { new: true }
    ).select("-password");

    if (!contributor) {
      return res.status(404).json({ message: "Contributor not found" });
    }

    res.json({
      message: "Profile picture updated",
      contributor,
    });
  } catch (err) {
    console.error("❌ Update Picture Error:", err);
    res.status(500).json({
      message: "Failed to update profile picture",
      error: err.message,
    });
  }
};
