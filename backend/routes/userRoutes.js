const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/userController');

router.get('/me', authRequired, getMe);
router.put('/me', authRequired, updateMe);

module.exports = router;
