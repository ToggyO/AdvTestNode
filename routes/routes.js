const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
  res.render('index', {
    title: "My title",
    text: "Ny text",
    footer: "My footer",
    yep: "Yep!!"
  });
});




module.exports = router;
