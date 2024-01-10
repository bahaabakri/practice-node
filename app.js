const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user')
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// let savedUserId
app.use((req, res, next) => {
  const userId = '659819c0a4c7f86dc0995791'
  User.findById(userId)
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);
/**
 * Connect to mongoDB
 */
mongoConnect(() => {
  User.fetchAll()
  .then(users => {
    // if (users.length == 0) {
    //   // we don't have user create new one
    //   const user = new User('Bahaa', 'bahaa.bakri@gmail.com')
    //   return user.save()
    // }
  })
  .then(user => {
    // savedUserId = user.ops[0]._id
    // console.log(user.ops[0]._id)
    app.listen(3000);
  })
  .catch(err => {
    console.log('Something Went Wrong!!')
  })
});
