const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./root/routes');



const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/javascript', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
);
app.use(router);



module.exports = app;
