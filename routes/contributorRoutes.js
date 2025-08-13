const express=require('express');
const router=express.Router();
const controller = require('../controllers/contributorController');
const authMiddleware = require('../middlewares/auth');

const upload = require('../middlewares/upload');
router.post('/register', controller.register);
router.post('/login', controller.login);
router.put('/update-profile-picture', authMiddleware, upload.single('image'), controller.updateProfilePicture);

module.exports = router;