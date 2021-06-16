const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer'); // package for save images
const allowMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
const path = require('path');
const checkAuth = require('../middleware/checkAuth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (allowMimeTypes.indexOf(file.mimetype) > 0) {
        cb(null, true); // save file
    } else {
        // cb(null, false); // not save file without errors
        cb(new Error('Wrong file format'), false); // not save file
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 mb
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
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
});

router.post('/', upload.single('productImage'), checkAuth, (req, res, next) => {
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
});

router.get('/:productId', (req, res, next) => {
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
});

router.delete('/:productId', (req, res, next) => {
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
});

module.exports = router;