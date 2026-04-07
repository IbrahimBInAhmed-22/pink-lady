const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { signup, login } = require('../controllers/auth.controller');

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));

module.exports = router;
