const express = require('express');
const router  = express.Router();
const controller= require('../controllers/adminController');

const auth      = require('../middlewares/auth');       // JWT verify
const  adminAuth  = require('../middlewares/admin'); // extra admin check

// Admin actions (public routes)
router.post('/register', controller.adminRegister);   // 👈 no auth
router.post('/login',    controller.adminLogin);      // 👈 no auth

// Protected admin route
router.patch('/:id/review', auth, adminAuth, controller.reviewContributor);
router.get('/pending', auth, adminAuth, controller.getPendingContributors);

module.exports = router;