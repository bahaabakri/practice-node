
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const connectWithMongooseUri = 'mongodb+srv://bahaabakri1995:a5b0c1d1MONGODB@store.4mfhky3.mongodb.net'
const store = new MongoDBStore({
    uri: connectWithMongooseUri,
    collection: 'sessions'
  });
  module.exports = store