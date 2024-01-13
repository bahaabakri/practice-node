const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // {items:[]}
    this._id = id;
  }

  /**
   * To add new user
   * @returns
   */
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
  /**
   * Find user by id
   * @param {*} userId
   * @returns
   */
  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) });
  }

  /**
   * Get users list
   * @returns
   */
  static fetchAll() {
    const db = getDb();
    return db.collection("users").find().toArray();
  }

  ////////////////////////////  CART //////////////////////////////
  /**
   * To add product to cart
   */
  addToCart(product) {
    let newQty = 1;
    let updatedCartItems;
    // check if the product has already existed
    console.log(product);
    const prodIndex = this.cart.items.findIndex(
      (el) => el.productId.toString() === product._id.toString()
    );
    if (prodIndex > -1) {
      // product has already existed => add quantity
      const updatedProduct = {
        productId: new mongodb.ObjectId(product._id),
        quantity: this.cart.items[prodIndex].quantity + 1,
      };
      this.cart.items[prodIndex] = updatedProduct;
      updatedCartItems = { items: this.cart.items };
    } else {
      // add product
      const updatedProduct = {
        productId: new mongodb.ObjectId(product._id),
        quantity: newQty,
      };
      updatedCartItems = { items: [...this.cart.items, updatedProduct] };
    }
    return this.updateCart(updatedCartItems);
  }

  /**
   * To delete from cart
   */
  deleteFromCart(productId) {
    let updatedCartItems = {
      items: this.cart.items.filter(
        (el) => el._id.toString() !== productId.toString()
      ),
    };
    return this.updateCart(updatedCartItems);
  }

  /**
   * To updated cart object inside user
   */
  updateCart(updatedCartItems) {
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCartItems } }
      );
  }

  /**
   * To get cart data
   */
  getCart() {
    // from cart get list of productsIds
    const productIds = this.cart.items.map((el) => el.productId);
    // from products collection get products for cart items and add quantity which we get it from cart
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((prodEl) => {
          return {
            ...prodEl,
            quantity: this.cart.items.find(
              (cartEl) => cartEl.productId.toString() === prodEl._id.toString()
            ).quantity,
          };
        });
      });
  }

  ////////////////////////////  ORDER //////////////////////////////

  /**
   * Create New Order
   */
  createOrder() {
    const db = getDb();
    let order = {};
    return this.getCart()
      .then((cartProducts) => {
        // prepare order
        order = {
          products: cartProducts,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
          },
        };
        // add to db
        return db.collection("orders").insertOne(order);
      })
      .then((_) => {
        // reset cart
        this.cart = { items: [] };
        return this.updateCart(this.cart);
      });
  }

  /**
   * Get order for this user
   */
  getUserOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id)})
      .toArray();
  }
}

module.exports = User;
