
const store = require('../session-store')
const User = require("../models/user");
const bcryptjs = require("bcryptjs")
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const sendGridTransport = require('nodemailer-sendgrid-transport');
const { now } = require('mongoose');
const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}))
exports.getLogin = (req, res, next) => {
    const  flashMessage = req.flash('error')
    const errorMessage = flashMessage.length > 0 ? flashMessage[0] : null
    // console.log('errorMessage ', errorMessage)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage:errorMessage
    })
}

exports.getSignup = (req, res, next) => {
    const  flashMessage = req.flash('error')
    const errorMessage = flashMessage.length > 0 ? flashMessage[0] : null
    res.render('auth/signup', {
      path: '/auth/signup',
      pageTitle: 'Signup',
      errorMessage:errorMessage
    });
  };

  exports.getForgetPassword = (req, res, next) => {
    const  flashMessage = req.flash('error')
    const errorMessage = flashMessage.length > 0 ? flashMessage[0] : null
    res.render('auth/forget-password', {
      path: '/auth/forget-password',
      pageTitle: 'Forget Password',
      errorMessage:errorMessage
    });
  }

  exports.postForgetPassword = (req, res, next) => {
    const email = req.body.email 
    User.findOne({email:email})
    .then(user => {
        if (!user) {
            req.flash('error', "This Email hasn't existed, try again")
            return res.redirect('/auth/forget-password')
        }
        // email exist => generate token then send reset link to this email
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                req.flash('error', "Something Went Wrong, try again")
                return res.redirect('/auth/forget-password')
            }
            user.resetToken = buffer.toString('hex')
            user.resetTokenExpiration = Date.now() + (60*60*1000)
            return user.save()
            // .then(user => {
            //     // send reset link to this email
            //     return transporter.sendMail({
            //         to: 'baha@innovationfactory.biz',
            //         from: 'bahaa.bakri1995@gmail.com',
            //         subject: "Reset your password",
            //         html: `<p>You asked to reset your password please use this link to reset
            //             <a href='http://localhost:3000/auth/reset-password/${user.resetToken}'>
            //                 Reset Password
            //             </a>
            //         </p>`,
            //     })
            // })
            .then(_ => {
                // password has been rested successfully
                return res.redirect('/auth/login')
            })
        })
    })
    .catch(err => {
        console.log(err)
    })
  }

  exports.getResetPassword = (req, res, next) => {
    const token = req.params.token
    const  flashMessage = req.flash('error')
    const errorMessage = flashMessage.length > 0 ? flashMessage[0] : null
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        if (user) {
            res.render('auth/reset-password', {
                path: '/auth/reset-password',
                pageTitle: 'Reset Password',
                token: token,
                errorMessage:errorMessage
            });
        }
    })
    
  }

  exports.postResetPassword = (req, res, next) => {
    const token = req.body.token
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        if (user) {
            // reset password
            return bcryptjs.hash(password, 12)
            .then(hashedPassword => {
                user.password = hashedPassword
                user.resetToken = undefined
                user.resetTokenExpiration = undefined
                return user.save()
            })
            .then(_ => {
                return res.redirect('/auth/login')
            })
        }
    })
  }
exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            // Email doesn't exist
            req.flash('error', 'Invalid Email or Password')
            return res.redirect('/auth/login')
        }
        bcryptjs.compare(password, user.password)
        .then(val => {
            if (val) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.user = user;
                return res.redirect('/');
            } else {
                req.flash('error', 'Invalid Email or Password')
                return res.redirect('/auth/login')
            }
        })

    })
    .catch(err => console.log(err));
}
exports.postSignup = (req, res, next) => {
    // console.log('sdfsdf sdfs d')
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    User.findOne({email: email})
    .then(user => {
        if (user) {
            // User is already exist
            req.flash('error', 'User has already existed')
            return res.redirect('/auth/signup')
        }
        // add new user
        return bcryptjs.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email:email,
                password:hashedPassword,
                cart:{
                    items: []
                }
            })
            return user.save()
        })
    })
    // .then (_ => {
    //     // send email
    //     return transporter.sendMail({
    //         to: 'baha@innovationfactory.biz',
    //         from: 'bahaa.bakri1995@gmail.com',
    //         subject: "Welcome to our team",
    //         html: `<h1>Welcome to our team ${email}</h1>`,
            
    //     })
    // })
    .then(_ => {
        // user added
        return res.redirect('/auth/login')
    })
    .catch(err => {
        console.log(err)
    })

};
exports.postLogout = (req, res, next) => {
    const sessionId = req.session.id;
    req.session.destroy( err => {
        if (err) {
            console.log(err)
        } else {
            console.log('Session destroyed');
            // destroy session in the store
            store.destroy(sessionId, (err) => {
                if (err) {
                    console.log('Error destroying session in store:', err);
                } else {
                    console.log('Session destroyed in store');
                    res.redirect('/auth/login')
                }
            });
        }
        
    })
}

