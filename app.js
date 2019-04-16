const express = require('express');
/* eslint-disable no-unused-vars*/
const ejs = require('ejs');
/* eslint-enable no-unused-vars*/
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset'); //хэширование путей статических файлов
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


const routes = require('./routes');
const cfg = require('./cfg');

//database
mongoose.set('debug', cfg.IS_PRODUCTION);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.on('close', () => console.log('Database connection closed.'));
db.once('open', () => {
  const info = mongoose.connections[0];
  // console.log(mongoose.connections[0]);
  console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  //require('./mocks')(); //создание рандомных постов
});
mongoose.connect(cfg.mongoURI, { useNewUrlParser: true });
//

//express
const app = express();

// sessions
app.use(
  session({
    secret: cfg.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

//sets and uses
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/javascript', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
);

//routes
app.get('/', (req, res) => {
  //фиксируем login и id сессии в переменныя для передачи в шаблон
    const id = req.session.userId;
    const login = req.session.userLogin;

    res.render('index', {
      user : {
        id,
        login
      }
    });
});

app.use('/api/auth', routes.auth);
app.use('/post', routes.post);
app.use('/archive', routes.archive);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});


app.use((error, req, res) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: !cfg.IS_PRODUCTION ? error : {},
  });
});
//

//server
app.listen(cfg.port, () => {
  console.log(`Server has been started on port ${cfg.port}`);
});
