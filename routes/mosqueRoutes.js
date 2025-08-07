const express=require('express');
const router = express.Router();
const mosqueController = require('../controllers/mosqueController');
const auth = require('../middlewares/auth');
router.post('/', auth, mosqueController.addmosque);
router.get('/', mosqueController.getAllMosques);
router.get('/my', auth, mosqueController.getMyMosques);

module.exports = router;