const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const sareeController = require('../controllers/sareeController');
const { authRequired, requireRole } = require('../middleware/auth');

// Public (shop)
router.get('/all', sareeController.getAllSarees);
router.get('/:id', sareeController.getSareeById);

// Admin only
router.post('/add', authRequired, requireRole('ADMIN'), upload.array('photos', 3), sareeController.addSaree);
router.put('/update/:sareeId', authRequired, requireRole('ADMIN'), upload.array('photos', 3), sareeController.updateSaree);
router.delete('/delete/:sareeId', authRequired, requireRole('ADMIN'), sareeController.deleteSaree);

module.exports = router;
