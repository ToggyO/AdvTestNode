const express = require('express');
const router = express.Router();
const tr = require('transliter');
// const TurndownService = require('turndown'); //преобразование html-тегов в markdown-разметку UPD: исключен из проекта

const models = require('../models');

// GET for edit
router.get('/edit/:id', async (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const id = req.params.id.trim().replace(/ +(?= )/g, '');

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findById(id).populate('uploads'); //наполнение свойста uploads модели Post не айдишниками, а картинками

      if (!post) {
        const err = new Error('Not found');
        err.status = 404;
        next(err);
      }

      res.render('post/edit', {
        post,
        user: {
          id: userId,
          login: userLogin
        }
      });

    } catch (error) {
      console.log(error);
    }


  }
});

// GET for add
router.get('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) { //если user не авторизован, то будет редирект на главную
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findOne({
        owner: userId,
        status: 'draft'
      });

      if (post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        const post = await models.Post.create({
          owner: userId,
          status: 'draft'
        });
        res.redirect(`/post/edit/${post.id}`);
      }
    } catch (error) {
      console.log(error);
    }
    // res.render('post/edit', {
    //   user: {
    //     id: userId,
    //     login: userLogin
    //   }
    // });
  }
});

//POST is add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
   res.redirect('/');
 } else {
   const title = req.body.title.trim().replace(/ +(?= )/g, ''); //trim() убирает пробелы в начале и в конце. replace(руглярка) убирает двойные пробелы
   const body = req.body.body.trim();
   //преобразовает html-теги из полей поста в markdown-разметку
   const isDraft = !!req.body.isDraft; // !! преобразование в булевский тип
   const postId = req.body.postId;
      // const turndownService = new TurndownService();
  // Для перевода title в url (актуально! вместо  URLSlugify)
  const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;


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
   } else if (!postId) {
     res.json({
       ok: false
     });
   } else {
     try {
         const post = await models.Post.findOneAndUpdate({
           _id: postId,
           owner: userId
         },
         {
           title,
           body,
           url,
           owner: userId,
           status: isDraft ? 'draft' : 'published'
         },
         {
           new: true
         });

         if (!post) {
           res.json({
             ok: false,
             error: "Пост не твой!"
           });
         } else {
           res.json({
             ok: true,
             post
           });
         }

     } catch (error) {
       res.json({
         ok: false
       });
     }
   }
 }
});



module.exports = router;
