const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const connectWithMongoose = require("./util/database").connectWithMongoose;
const User = require("./models/user");
const session = require("express-session");
const store = require('./session-store')
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// session implementation
app.use(session(
  { secret: "secret", resave: false, saveUnintialized: false, store: store }
));
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// app.use((req, res, next) => {
//   const allowedOrigins = ['http://localhost:3000/'];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//        res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', true);
//   return next();
// });
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

connectWithMongoose
  .then(() => {
    console.log("Connected");
    app.listen(3000);
    // create user or get saved one
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Bahaa",
          email: "bahaa@gmail.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
  })
  .catch((err) => {
    console.error(err);
  });
