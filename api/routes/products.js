const express = require('express');
const router = express.Router();
const multer = require('multer'); // package for save images
const allowMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
const path = require('path');
const checkAuth = require('../middleware/checkAuth');

const productsController = require('../controlles/products');

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

router.get('/', productsController.getAll);
router.get('/:productId', productsController.getById);
router.post('/', checkAuth, upload.single('productImage'), productsController.createProduct);
router.patch('/:productId', checkAuth, productsController.updateProduct);
router.delete('/:productId', checkAuth, productsController.deleteProduct);

module.exports = router;