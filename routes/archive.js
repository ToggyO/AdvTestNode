const express = require('express');
const router = express.Router();

const cfg = require('../cfg');
const models = require('../models');

router.get('/:page', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  const perPage = cfg.PER_PAGE;
  const page = req.params.page || 1 //если page не задана, то по умолчанию задется в строке браузера 1

  models.Post.find({}).skip(perPage * page - page)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
  .limit(perPage)
  .then(posts => {
    models.Post.count().then(count => {
      res.render('index', {
        posts,
        currentPage,
        pages
        user: {
          id: userId,
          login: userLogin
        }
      })
    })
  })
});


module.exports = router;
