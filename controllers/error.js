exports.get404 = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  res.status(404).render("404", 
  { 
    pageTitle: "Page Not Found",
    path: "/404",
    isLogin: req.session.isLogin
  });
};
