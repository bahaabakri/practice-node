const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();
const isAuth = require('../middleware/is-auth')
// // /admin/add-product => GET
router.get('/add-product', isAuth,  adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth,  adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',
isAuth,
[
    body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({min:3}).withMessage('Title should be at least 3 characters'),
    
    // body('imageUrl')
    // .isURL().withMessage('Enter valid url'),
    // body('imageUrl').custom((value, {req}) => {
    //     if (!value.match(/^https*\:\/\/\w*$/g)) {
    //         throw new Error('Enter valid url')
    //     }
    //     return true
    // }),
    body('price')
    .notEmpty().withMessage('Price is required'),
    body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({min:3}).withMessage('Description should be at least 3 characters'),
]
,
adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product',isAuth,
    body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({min:3}).withMessage('Title should be at least 3 characters'),

    // body('imageUrl')
    // .isURL().withMessage('Enter valid url'),
    // body('imageUrl').custom((value, {req}) => {
    //     if (!value.match(/^https*\:\/\/\w*$/g)) {
    //         throw new Error('Enter valid url')
    //     }
    //     return true
    // }),
    body('price')
    .notEmpty().withMessage('Price is required'),
    body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({min:3}).withMessage('Description should be at least 3 characters'),
adminController.postEditProduct);

router.post('/delete-product',isAuth,  adminController.postDeleteProduct);

module.exports = router;
