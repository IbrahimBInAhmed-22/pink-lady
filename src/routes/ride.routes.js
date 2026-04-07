const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { requestRide } = require('../controllers/ride.controller');

router.post('/request', asyncHandler(requestRide));

module.exports = router;
