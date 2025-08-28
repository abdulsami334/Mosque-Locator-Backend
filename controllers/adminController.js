const Contributor = require("../models/contributor");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Contributor.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    await Contributor.create({
      name,
      email,
      password: hash,
      approved: true,
      isAdmin: true
    });
    res.status(201).json({ message: 'Admin registered' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Contributor.findOne({ email, isAdmin: true });
    if (!admin) return res.status(401).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.reviewContributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const contributor = await Contributor.findById(id);
    if (!contributor) return res.status(404).json({ message: 'Contributor not found' });
    if (contributor.approved) return res.status(400).json({ message: 'Already processed' });

    if (action === 'approve') {
      contributor.approved = true;
      await contributor.save();
      console.log('BODY:', req.body);
      return res.json({ message: 'Contributor approved', contributor });
    }

    await Contributor.findByIdAndDelete(id);
    res.json({ message: 'Contributor rejected and removed' });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

exports.getPendingContributors = async (req, res) => {
  try {
    const pending = await Contributor.find({ approved: false }).select('-password');
    res.json({ success: true, data: pending });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};