const express=require('express');
const router = express.Router();
const mosqueController = require('../controllers/mosqueController');
const auth = require('../middlewares/auth');
router.post('/', auth, mosqueController.addMosque);
router.get('/', mosqueController.getAllMosques);
router.get('/my', auth, mosqueController.getMyMosques);
router.put('/:id', auth, mosqueController.updateMosque);
router.get('/nearby', mosqueController.getNearbyMosques);

module.exports = router;