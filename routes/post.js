const express = require('express');
const router = express.Router();
const TurndownService = require('turndown'); //преобразование html-тегов в markdown-разметку

const models = require('../models');

// GET for add
router.get('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) { //если user не авторизован, то будет редирект на главную
    res.redirect('/');
  } else {
    res.render('post/add', {
      user: {
        id: userId,
        login: userLogin
      }
    });
  }
});

//POST is add
router.post('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
   res.redirect('/');
 } else {
   const title = req.body.title.trim().replace(/ +(?= )/g, ''); //trim() убирает пробелы в начале и в конце. replace(руглярка) убирает двойные пробелы
   const body = req.body.body;
   //преобразовает html-теги из полей поста в markdown-разметку
   const turndownService = new TurndownService();

   if (!title || !body) {

     const fields = [];

     if (!title) fields.push('title');
     if (!body) fields.push('body');

     res.json({
       ok: false,
       error: "Все поля должны быть заполнены",
       fields //это поле отвечает за вывод массива fields, в котором указаны незаполненные поля
     });
   } else if (title.length < 3 || title.length > 64) {
     res.json({
       ok: false,
       error: "Длина заголовка от 3 до 64 символов!",
       fields: ['title']
     });
   } else if (body.length < 3) {
     res.json({
       ok: false,
       error: "Текст поста не менее 3 символов!",
       fields: ['body']
     });
   } else {
     models.Post.create({
       title,
       body: turndownService.turndown(body), //преобразовает html-теги из полей поста в markdown-разметку
       owner: userId
     }).then(post => {
       console.log(post);
       res.json({
         ok: true
       });
     }).catch(err => {
       console.log(err);
       res.json({
         ok: false
       });
     })
   }
 }


});


module.exports = router;
