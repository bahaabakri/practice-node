const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer')
const errorController = require("./controllers/error");
const connectWithMongoose = require("./util/database").connectWithMongoose;
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const csrfProtection = require('csurf')()
const flash = require('connect-flash')
// const store = require('./session-store')
const app = express();
// const MONGODB_URI =
// 'mongodb+srv://bahaabakri1995:a5b0c1d1MONGODB@store.4mfhky3.mongodb.net/?retryWrites=true&w=majority';

 
// const store = new MongoDBStore({
//   uri: MONGODB_URI,
//   collection: 'sessions'
// });
const connectWithMongooseUri = 'mongodb+srv://bahaabakri1995:a5b0c1d1MONGODB@store.4mfhky3.mongodb.net'
const store = new MongoDBStore({
    uri: connectWithMongooseUri,
    collection: 'sessions'
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorRoutes = require("./routes/errors")

// multer configrations

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images/')
  },
  filename:(req, file, cb) => {
    console.log(new Date().toISOString().replace(/:/g, "-") + file.originalname);
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  } 
})
// body parser
app.use(bodyParser.urlencoded({ extended: false }));

// multer
app.use(multer({storage:fileStorage}).single('image'))

// const upload = multer({
//   storage: fileStorage,
// });

// app.post('/upload', upload.single('image'), function (req, res, next) {
//   console.log(req.file)
//   // req.file is your image 
//   // req.body will hold the text fields, if there were any
// })
// static files js and css
app.use(express.static(path.join(__dirname, "public")));

// session implementation
app.use(session(
  { secret: "secret", resave: false, saveUnintialized: false, store: store }
));

// csrf middleware
app.use(csrfProtection)
// flash message
app.use(flash())

// save user from session
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {
        // expected error
        return next()
      }
      req.user = user;
      next();
    })
    .catch(err => {
      // tech Error
      throw new Error(err)
    });
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

// global views variables
app.use((req, res, next) => {
  res.locals.isLogin = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})

// middlewares
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use('/errors', errorRoutes);
// Errors Middlewares
app.use((error, req, res, next) => {
  res.status(error.httpStatusCode).render("errors/500", 
  { 
    pageTitle: "Internal Server Error",
    path: "/500"
  });
})
app.use(errorController.get404)

connectWithMongoose
  .then(() => {
    console.log("Connected");
    app.listen(3000);
  })
  .catch((err) => {
    console.error(err);
  });
