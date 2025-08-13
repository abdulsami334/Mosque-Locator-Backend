const Contributor = require('../models/contributor');
const Mosque = require('../models/mosque');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
})
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


exports.register= async(req, res)=>{
    const{ name, email, password, phone, city, area, reason}=req.body;
    const existing=await Contributor.findOne({email});
    if(existing)return res.status(400).json({message: 'Already registered' });
        const hash=await bcrypt.hash(password,10);
        const contributor=await Contributor.create({
  name, email, password: hash, phone, city, area, reason

        }) 
res.status(201).json({message:'Registration submitted. Wait for approval.' })
}

exports.login=async(req, res)=>{
const {email, password}=req.body;
 const contributor = await Contributor.findOne({ email });

 if(!contributor|| !contributor.approved){
    return res.status(401).json({message: 'Invalid credentials or not approved'})
 }
   const isMatch = await bcrypt.compare(password, contributor.password);
   if(!isMatch){
    return res.status(400).json({ message: 'Incorrect password' });

   }
   const token=jwt.sign({ id: contributor._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
   res.json({ token, contributor:{
       contributor: {
    name: contributor.name,
    email: contributor.email,
     password: contributor.password,
  phone: contributor.phone,
  city: contributor.phone,
  area: contributor.area,
  reason: contributor.reason,
  approved:contributor.approved,
    isContributor: true
  }
   } });
}





exports.updateProfilePicture = async (req, res) => {
  try {
    const contributorId = req.user.id; // JWT auth se
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // ✅ Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      folder: 'mosque_locator/profile_pics',
    });

    // ✅ Remove local file
    fs.unlinkSync(req.file.path);

    // ✅ Update DB
    const contributor = await Contributor.findByIdAndUpdate(
  contributorId,
  { imageUrl: uploadRes.secure_url },
  { new: true }
).select('-password');

res.json({ message: 'Profile picture updated', contributor });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update profile picture',
      error: err.message,
    });
  }
};