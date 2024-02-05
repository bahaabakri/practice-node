
const store = require('../session-store')
const User = require("../models/user");
const bcryptjs = require("bcryptjs")
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const sendGridTransport = require('nodemailer-sendgrid-transport')
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
    .then(res => {
        if (!res) {
            req.flash('error', "This Email hasn't existed, try again")
            return res.redirect('/auth/login')
        }
        // email exist => generate token then send reset link to this email

    })
    .catch(err => {

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
    .then (_ => {
        // send email
        return transporter.sendMail({
            to: 'baha@innovationfactory.biz',
            from: 'bahaa.bakri1995@gmail.com',
            subject: "Welcome to our team",
            html: `<h1>Welcome to our team ${email}</h1>`,
            
        })
    })
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

