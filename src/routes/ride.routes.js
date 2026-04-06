const router = require('express').Router();
const { requestRide } = require('../controllers/ride.controller');

router.post('/request', requestRide);

module.exports = router;
