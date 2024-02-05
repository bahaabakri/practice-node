const express = require('express')

const router = express.Router()
const isAuth = require('../middleware/is-auth')
const authController = require('../controllers/auth')
router.get('/login', authController.getLogin)

router.post('/login', authController.postLogin)

router.get('/signup', authController.getSignup);

router.post('/signup', authController.postSignup);

router.get('/forget-password', authController.getForgetPassword)

router.post('/forget-password', authController.postForgetPassword)

router.post('/logout', authController.postLogout)

module.exports = router;