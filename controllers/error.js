exports.get404 = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  res.status(404).render("errors/404", 
  { 
    pageTitle: "Page Not Found",
    path: "/404"
  });
};


exports.get500 = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  res.status(500).render("errors/500", 
  { 
    pageTitle: "Internal Server Error",
    path: "/500"
  });
};
