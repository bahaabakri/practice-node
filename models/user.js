const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
  name: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items:[
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref:'Product'
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
})

/**
 * To Add product the cart
 * @param {*} product 
 * @returns 
 */
userSchema.methods.addToCart = function(product) {
      const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId:  product._id,
        quantity: newQuantity
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart
    return this.save()
}

/**
 * To Remove product from cart
 * @param {*} productId 
 * @returns 
 */
userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart
    return this.save()
}

/**
 * To Reset Cart
 */
userSchema.methods.resetCart = function() {
  const updatedCart = {
    items: []
  };
  this.cart = updatedCart
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
