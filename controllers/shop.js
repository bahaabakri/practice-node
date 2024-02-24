const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order')
exports.getProducts = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  Product
    .find()
    // .select('title price -_id')
    // .populate('userId', 'name -_id')
    .then(products => {
      // console.log(products)
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products' ,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};    

exports.getIndex = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getCart = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  req.user
    .populate({
      path: 'cart.items.productId'
    })
    .then(user => {
      console.log(user)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items
      });
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postOrder = (req, res, next) => {
  // get cart data
  // console.log(req.user.cart)
   const order = new Order({
    items:req.user.cart.items,
    userId:req.user._id
   })
   console.log(order)
   order.save()
    .then(_ => {
      // reset cart
      return req.user.resetCart()
    })
    .then(_ => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  Order.find({userId: req.user._id})
    .populate('items.productId')
    .populate('userId')
    .then(orders => {
      console.log(orders)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};
