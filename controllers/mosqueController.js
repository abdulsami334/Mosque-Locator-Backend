const Contributor = require('../models/contributor')
const Mosque=require('../models/mosque')

exports.addmosque=async(req, res)=>{
    const mosque=await Mosque.create({
        ...req.body,
        contributorId:req.user.id,
        verified: false
    });
    res.status(201).json(mosque);
}
exports.getAllMosques = async (req, res) => {
  const mosques = await Mosque.find();
  res.json(mosques);
};
exports.getMyMosques = async (req, res) => {
  const mosques = await Mosque.find({ contributorId: req.user.id });
  res.json(mosques);
};