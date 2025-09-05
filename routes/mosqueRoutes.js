const express=require('express');
const router = express.Router();
const  adminAuth  = require('../middlewares/admin'); 
const mosqueController = require('../controllers/mosqueController');
const auth = require('../middlewares/auth');
router.post('/', auth, mosqueController.addMosque);
router.get('/',auth, adminAuth, mosqueController.getAllMosques);
router.get('/my', auth, mosqueController.getMyMosques);
router.put('/:id', auth, mosqueController.updateMosque);
router.get('/nearby', mosqueController.getNearbyMosques);
router.get('/stats',auth, adminAuth, mosqueController.getMosqueStats);
router.patch('/:id/review', auth, adminAuth, mosqueController.reviewMosque);

module.exports = router;