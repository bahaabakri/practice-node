const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit');
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1
  const perPage = 3
  let total
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  Product.countDocuments({userId: {$ne: req.user._id}})
  .then(totalProducts => {
    total = totalProducts
    return Product.find({userId: {$ne: req.user._id}})
          .limit(perPage)
          .skip((page - 1) * perPage)
  })  
  // .select('title price -_id')
  // .populate('userId', 'name -_id')
  .then(products => {
    // console.log(products)
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products' ,
      path: '/products',
      currentPage:page,
      perPage:perPage,
      nextPage: page * perPage < total ? page + 1 : null,
      prevPage: page != 1 ? page - 1 : null,
      lastPage: Math.ceil(total / perPage),
      showPagination: total > perPage
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
  
  const page = +req.query.page || 1
  const perPage = 3 
  let total
  Product.countDocuments({userId: {$ne: req.user._id}})
  .then(totalProducts => {
    total = totalProducts
    return Product.find({userId: {$ne: req.user._id}})
          .limit(perPage)
          .skip((page - 1) * perPage)
  })  
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage:page,
      perPage:perPage,
      nextPage: page * perPage < total ? page + 1 : null,
      prevPage: page != 1 ? page - 1 : null,
      lastPage: Math.ceil(total / perPage),
      showPagination: total > perPage
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
      // console.log(err)
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

exports.getInvoice = (req, res, next) => {
  console.log(req.params.orderId)
  const orderId = req.params.orderId
  Order.findById(orderId)
  .populate('items.productId')
  .then(order => {
    if (!order) {
      return next('No Order Found')
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return next('Unauthorized !!')
    }
    const invoiceName = 'invoice-' + orderId + '.pdf'
    const invoicePath = path.join('invoices', invoiceName)
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err)
    //   }
    //   res.setHeader('Content-Type', 'application/pdf')
    //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
    //   res.send(data)
    // })
    // const fileStream = fs.createReadStream(invoicePath)
    // res.setHeader('Content-Type', 'application/pdf')
    // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
    // fileStream.pipe(res)


    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf')
    // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);

    // doc.text('Invoice',200, 100, {
    //   underline:true,
    //   fontSize: 25
    // });
    doc.text(`Order No ${order.id}`, {
      underline:true,
      fontSize: 25
    });
    doc.text('------------------------------------------')
    doc.moveDown();
    let total = 0
    order.items.forEach(product => {
      total += product.productId.price
      doc.text(`${product.productId.title} -------------------- ${product.productId.price} x ${product.quantity} = ${product.quantity * product.productId.price} $`);
    })
    doc.text('------------------------------------------')
    doc.moveDown();
    doc.text(`Total ${total} $`, {
      fill:'green',
      fontSize: 25
    })
    doc.end()
  })
  .catch(err => {
    const error = new Error('Some thing went wrong')
    error.httpStatusCode = 500
    return next(error)
  })


}
