const express = require('express');
const router = express.Router();
const passport = require('passport');
const UserCtrl = require('../../controllers/userCtrl');

router.post('/register', UserCtrl.createScientist);
router.post('/login', UserCtrl.login);
router.get('/confirmEmail', UserCtrl.confirmEmail);
router.get('/myOrders', passport.authenticate('jwt', { session: false }), UserCtrl.getUserOrders);
router.get('/current', passport.authenticate('jwt', { session: false }), UserCtrl.getCurrentUser);

router.get('/getAllUsers', UserCtrl.getAllUsers);
router.get('/:id', UserCtrl.getUserById);


module.exports = router;