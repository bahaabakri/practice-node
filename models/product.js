const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId
    // this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection('products').insertOne(this);
  }

  update(prodId) {
    const db = getDb();
    return db.collection('products').updateOne({ _id: new mongodb.ObjectId(prodId) }, { $set: this });
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products').find().toArray()
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection('products').findOne({ _id: new mongodb.ObjectId(prodId) })
  }

  static deleteById(prodId) {
    const db = getDb();
    return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) })
  }
}

module.exports = Product;
