const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file')
exports.getAddProduct = (req, res, next) => {

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    errorArray:null,
    editing: false,
    product: null,
    errorMessage:null,
    savedData:{
      title:null,
      imageUrl:null,
      price:null,
      description:null
    }
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: 'Attached file should be an image',
      errorArray: [],
      product: null,
      savedData:{
          title:title,
          price:price,
          description:description
      }
  })
  }
  const err = validationResult(req)
  if (!err.isEmpty()) {
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage:null,
      errorArray: err.array(),
      product: null,
      savedData:{
          title:title,
          price:price,
          description:description
      }
  })
  }
  // handle imageUrl
  const imageUrl = image.path
  const product = new Product({
    // _id: new mongoose.Types.ObjectId('65a8e8c16bec2a5ac618729c'),
    title:title,
    price:price,
    imageUrl:imageUrl,
    description:description,
    userId:req.user
  });
  product.save()
    .then(result => {
      // console.log(result);
      // throw new Error()
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   errorMessage:'Error in creating this product',
      //   errorArray:null,
      //   product: null,
      //   savedData:{
      //       title:title,
      //       imageUrl:imageUrl,
      //       price:price,
      //       description:description
      //   }
      // })

      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getEditProduct = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        errorArray:null,
        errorMessage:null,
        editing: editMode,
        productId: req.params.productId,
        product: product,
        savedData:{
          title:null,
          imageUrl:null,
          price:null,
          description:null
        }
      });
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;
  const err = validationResult(req)
  if (!err.isEmpty()) {
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      errorArray: err.array(),
      errorMessage: null,
      product: null,
      productId: prodId,
      savedData:{
          title:updatedTitle,
          price:updatedPrice,
          description:updatedDesc
      }
  })
  }

  Product.findOne({_id:prodId, userId: req.user._id})
    .then(product => {
      product.title = updatedTitle
      product.price = updatedPrice
      product.description = updatedDesc
      if (updatedImage) {
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = updatedImage.path
      }
      return product.save()
    })
    .then(_ => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getProducts = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  // throw new Error('dummy error')
  Product.find({userId: req.user._id})
    .then(products => {
      // throw new Error('dummy error')
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      // throw new Error('dummy error')
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOne({_id:prodId, userId: req.user._id})
    .then(product => {
      if (!product) {
        throw new Error('Product not found')
      }
      fileHelper.deleteFile(product.imageUrl)
      return product.deleteOne()
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error('Some thing went wrong')
      error.httpStatusCode = 500
      return next(error)
    });
};
