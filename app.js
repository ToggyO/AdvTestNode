const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./root/routes');
const cfg = require('./root/cfg');
const staticAsset = require('static-asset'); //хэширование путей статических файлов
const mongoose = require('mongoose');

//database
mongoose.set('debug', cfg.IS_PRODUCTION);
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.on('close', () => console.log('Database connection closed.'));
db.once('open', () => {
  const info = mongoose.connections[0];
  // console.log(mongoose.connections[0]);
  console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
});
mongoose.connect(cfg.mongoURI, { useNewUrlParser: true });
//

//express
const app = express();

//sets and uses
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/javascript', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
);
app.use(router);
//

//server

app.listen(cfg.port, () => {
  console.log(`Server has been started on port ${cfg.port}`);
});
