const mongoose = require('mongoose');
const Product = require('../models/product');

exports.getAll = (req, res, next) => {
    Product.find()
        .select('_id name price productImage')
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }

            // if (docs.length > 0) {
            res.status(200).json(response);
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
}

exports.createProduct = (req, res, next) => {
    if (typeof req.file === 'undefined') {
        return res.status(500).json({
            error: 'File field is empty'
        });
    }

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.filename
    });
    product.save()
        .then(result => {
            res.status(201).json({
                message: 'Created product successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    productImage: result.productImage,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.getById = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('_id name price productImage')
        .then(docs => {
            console.log(docs);
            if (docs) {
                res.status(200).json({
                    product: docs,
                    request: {
                        type: 'GET',
                        description: "Get all products",
                        url: 'http://localhost:3000/products/'
                    }
                });
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
}

exports.updateProduct = (req, res, next) => {
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
                    url: 'http://localhost:3000/products/' + id
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
}

exports.deleteProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndRemove(id)
        .then(result => {
            console.log(result);
            if (result) {
                res.status(200).json({
                    message: 'Product deleted!',
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/products',
                        body: {name: "String", price: "Number"}
                    }
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
}