const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
let userPassword = 'a5b0c1d1MONGODB'
const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb+srv://bahaabakri1995:${userPassword}@store.4mfhky3.mongodb.net/?retryWrites=true&w=majority`
  )
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
