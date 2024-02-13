const Product = require('../models/product');
const { validationResult } = require('express-validator');
exports.getAddProduct = (req, res, next) => {

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    errorArray:null,
    editing: false,
    product: null,
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
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const err = validationResult(req)
  if (!err.isEmpty()) {
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorArray: err.array(),
      product: null,
      savedData:{
          title:title,
          imageUrl:imageUrl,
          price:price,
          description:description
      }
  })
  }
  const product = new Product({
    title:title,
    price:price,
    imageUrl:imageUrl,
    description:description,
    userId:req.user
  });
  product.save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // req.flash('error', 'Something went wrong')
      // return res.redirect('/admin/edit-product')
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
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const err = validationResult(req)
  if (!err.isEmpty()) {
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      errorArray: err.array(),
      product: null,
      productId: prodId,
      savedData:{
          title:updatedTitle,
          imageUrl:updatedImageUrl,
          price:updatedPrice,
          description:updatedDesc
      }
  })
  }
  Product.findOneAndUpdate({_id:prodId, userId: req.user._id}, {
    title:updatedTitle,
    price:updatedPrice,
    imageUrl:updatedImageUrl,
    description:updatedDesc
  })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // req.flash('error', 'Something went wrong')
      // return res.redirect('/admin/edit-product')
    });
};

exports.getProducts = (req, res, next) => {
  // const isLoginFromCookie = req.get('Cookie')?.indexOf('isLogin')
  // const isLogin = isLoginFromCookie > -1 ?  +req.get('Cookie').split('=')[1] : 0
  Product.find({userId: req.user._id})
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOneAndDelete({_id:prodId, userId: req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
