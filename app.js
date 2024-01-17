const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const connectWithMongoose = require('./util/database').connectWithMongoose;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findOne()
    .then(user => {
      req.user = user
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

connectWithMongoose.then(() => {
  console.log('Connected')
  app.listen(3000);
  // create user or get saved one
  User.findOne().then(user => {
    if (!user) {
      const user = new User({
        name:'Bahaa',
        email:'bahaa@gmail.com',
        cart: {
          items: []
        }
      })
      user.save()
    }
    
  })

})
.catch(err => {
  console.error(err)
})
