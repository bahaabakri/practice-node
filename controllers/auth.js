
const store = require('../session-store')
const User = require("../models/user");
const bcryptjs = require("bcryptjs")
exports.getLogin = (req, res, next) => {
    // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
    // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
    console.log(req.session.isLogin)
    
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLogin: false
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
      path: '/auth/signup',
      pageTitle: 'Signup',
      isLogin: false
    });
  };

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            // Email doesn't exist
            return res.redirect('/auth/login')
        }
        bcryptjs.compare(password, user.password)
        .then(val => {
            if (val) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return res.redirect('/');
            } else {

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
        // user added
        res.redirect('/auth/login')
    })
    .catch(err => {

    })

};
exports.postLogout = (req, res, next) => {
    const sessionId = req.session.id;
    // console.log(req.session)
    // console.log(sessionId)
    // res.clearCookie()
    // res.end()
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
                }
                res.redirect('/')
            });
        }
        
    })
}

