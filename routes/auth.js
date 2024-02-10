const express = require('express')
const User = require("../models/user");
const router = express.Router()
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth')
const authController = require('../controllers/auth')
router.get('/login', authController.getLogin)

router.post('/login',
[
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter valid email')
    .normalizeEmail(),
    // .custom((value, {req}) => {
    //     return User.findOne({email:value}).then(user => {
    //         if (!user) {
    //             return Promise.reject('Invalid Email address')
    //         }
    //     })
    // }),
    body('password')
    .notEmpty().withMessage('Password is required')
    .trim()
    // .custom((value, {req}) => {
    //     if (!value.match(/^[a-zA-Z0-9]+$/g)) {
    //         throw new Error('Password should contains just numbers and letters')
    //     }
    //     return true
    // }),
]
,authController.postLogin)

router.get('/signup', authController.getSignup);

router.post('/signup',
[
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter valid email')
    .custom((value, {req}) => {
        return User.findOne({email: value}).then(user => {
            if (user) {
                return Promise.reject('User has already existed')
            }
        })
    })
    .normalizeEmail(),
    
    body('password')
    .notEmpty().withMessage('Password is required')
    .isStrongPassword({minLength:6}).withMessage('Password should be at least six characters')
    .custom((value, {req}) => {
        if (!value.match(/^[a-zA-Z0-9]+$/g)) {
            throw new Error('Password should contains just numbers and letters')
        }
        return true
    })
    .trim(),

    body('confirmPassword')
    .notEmpty().withMessage('Confirmation Password is required')
    .custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match")
        }
        return true
    })
    .trim()

],
authController.postSignup);

router.get('/forget-password', authController.getForgetPassword)

router.post('/forget-password', authController.postForgetPassword)


router.get('/reset-password/:token', authController.getResetPassword)

router.post('/reset-password', authController.postResetPassword)

router.post('/logout', authController.postLogout)

module.exports = router;