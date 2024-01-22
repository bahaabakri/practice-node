
const store = require('../session-store')
const User = require("../models/user");
exports.getLogin = (req, res, next) => {
    // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
    // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
    console.log(req.session.isLogin)
    
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLogin: req.session.isLogin
    })
}

exports.postLogin = (req, res, next) => {
    console.log('Login Successfully')
    User.findOne()
    .then((user) => {
        req.session.isLogin = true
        req.session.user = user
        res.redirect('/')
    })
    .catch((err) => console.log(err));

}

exports.postLogout = (req, res, next) => {
    const sessionId = req.session.id;
    console.log(req.session)
    console.log(sessionId)
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
            });
        }
        res.redirect('/')
    })
}

