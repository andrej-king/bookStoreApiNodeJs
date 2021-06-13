const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .then(docs => {
            // if (docs.length > 0) {
            res.status(200).json(docs);
            // } else {
            //     res.status(200).json({message: "No entries found"});
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product added',
                createdProduct: product
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .then(docs => {
            console.log(docs);
            if (docs) {
                res.status(200).json(docs);
            } else {
                res.status(404).json({message: "No valid entry found for provided ID"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};

    // flexible update values
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    // write format
    /*[
        {"propName": "name", "value": "Harry Potter 3"}
    ]*/
    Product.findByIdAndUpdate({_id: id}, updateOps)
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'Product updated!',
                });
            } else {
                res.status(404).json({
                    message: 'Product not found!',
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndRemove(id)
        .then(result => {
            console.log(result);
            if (result) {
                res.status(200).json({
                    message: 'Product deleted!'
                });
            } else {
                res.status(404).json({
                    message: 'Product not found!',
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;