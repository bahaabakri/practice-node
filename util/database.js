const mongoose = require('mongoose');
const connectWithMongooseUri = 'mongodb+srv://bahaabakri1995:a5b0c1d1MONGODB@store.4mfhky3.mongodb.net/?retryWrites=true&w=majority'
const connectWithMongoose = mongoose.connect(connectWithMongooseUri)
exports.connectWithMongoose = connectWithMongoose;
