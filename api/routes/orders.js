const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');

const ordersController = require('../controlles/orders');

router.get('/', checkAuth, ordersController.getAll);
router.post('/', checkAuth, ordersController.createOrder);
router.get('/:orderId', checkAuth, ordersController.getSingle);
router.delete('/:orderId', checkAuth, ordersController.deleteOrder);

module.exports = router;