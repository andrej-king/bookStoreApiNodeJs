const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name') // get data from other schema
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                order: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                res.status(404).json({
                    message: 'Product not found',
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Order stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Product not found'
            });
        });
});

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('product quantity _id')
        .populate('product', 'name price')
        .then(order => {
            if (!order) {
                res.status(404).json({
                    message: 'Order not found!',
                });
            }

            res.status(200).json({
                order: {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity
                },
                request: {
                    type: 'GET',
                    'description': 'Get all orders',
                    url: 'http://localhost:3000/orders'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Order not found!',
            });
        })
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findByIdAndRemove(id)
        .then(result => {
            if (!result) {
                res.status(404).json({
                    message: 'Order not found!',
                });
            }
            res.status(200).json({
                message: 'Order deleted!',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders',
                    body: {product: "ID", quantity: "Number"}
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Order not found!',
            });
        });
});

module.exports = router;