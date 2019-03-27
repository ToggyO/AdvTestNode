const express = require('express');
const ejs = require('ejs');
const router = require('./routes/routes');

const port = process.env.PORT || 3000;

const app = express();
app.set("view engine", "ejs");
app.use(router);



app.listen(port, () => {
  console.log(`Server has been started on port ${port}`);
});
