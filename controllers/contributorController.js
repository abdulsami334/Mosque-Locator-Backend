const Contributor = require('../models/contributor');
const Mosque = require('../models/mosque');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
   res.json({ token, contributor });
}