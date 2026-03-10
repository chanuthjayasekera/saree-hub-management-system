const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.post('/', authRequired, ctrl.createOrder);
router.get('/mine', authRequired, ctrl.listMyOrders);

// admin
router.get('/all', authRequired, requireRole('ADMIN'), ctrl.listAllOrders);
router.put('/:id/status', authRequired, requireRole('ADMIN'), ctrl.updateOrderStatus);

module.exports = router;
