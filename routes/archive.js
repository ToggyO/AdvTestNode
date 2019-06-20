const express = require('express');
const router = express.Router();
const moment = require('moment'); // модуль для работы со временем (позволяет корректно отображать дату в комментариях)
const showdown  = require('showdown'); // преобразование markdown-разметки в html-код

moment.locale('ru');

const cfg = require('../cfg');
const models = require('../models');

async function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  const perPage = +cfg.PER_PAGE; //если поставить +, то прилетевшая из env строка преобразуется в числовой тип
  const page = req.params.page || 1; //если page не задана, то по умолчанию задется в строке браузера 1

  try {
    let posts = await models.Post.find({
      status: 'published' //поле из модели Post, показывающее, записан ли пост в базе ('draft', если пост "Черновик")
    })
      .skip(perPage * page - perPage)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
      .limit(perPage)
      .populate('owner') //присвоение полю owner модели Post полей из модели User
      .populate('uploads') //присвоение полю uploads модели Post полей из модели Upload, чтобы в посте, вместо айдишников картинок из БД, выводились сами картинки (объекты)
      .sort({ createdAt: -1 }) //вывод постов По дате (сначала самые новые)

      const converter = new showdown.Converter();
      // с помощью map вносим изменения в массив постов
      // и в каждом посте заменяем поле body с помощью Object.assign
      // на конвертированное поле body
      // assign смотрит на два объекта и заменяет одинаковые
      // поля на конвертированные
      posts = posts.map(post => {
        // записываем в переменную инфу из поля body поста
        let body = post.body;
        // проходим циклом forEach по массиву uploads модели Post
        // по всей длине массива (length)
        // и через replace() заменяем id (upload.id) картинки из БД
        // на путь картинки (тоже из БД) (upload.path)
        if (post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(`image${upload.id}`, `/${cfg.DESTINATION}${upload.path}`);
          });
        }

        return Object.assign(post, {
          body: converter.makeHtml(body)
        });
      });

      const count = await models.Post.countDocuments();

      res.render('archive/index', {
        posts,
        current: page,
        pages: Math.ceil(count / perPage),
        user: {
          id: userId,
          login: userLogin
        }
      });
  } catch (error) {
    throw new Error('Server Error');
  }
}


//routes
router.get('/', (req, res) => posts(req, res));

//pagination
router.get('/archive/:page', (req, res) => posts(req, res));

//post-page
router.get('/posts/:post', async (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!url) {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
  } else {

    try {
      const post = await models.Post.findOne({
        url,
        status: 'published'
      }).populate('uploads');

      if (!post) {
        const err = new Error('Not found');
        err.status = 404;
        next(err);
      } else {

        //передаем комментарии в роут поста
        const comments = await models.Comment.find({
          post: post.id,
          parent: { $exists: false }

        });
        // .populate({
        //   path: 'children',
        //   populate: {
        //     path: 'children'
        //   }
        // }); //наполнение модели поста полем children из модели Comment

        //
        const converter = new showdown.Converter();

        let body = post.body;
        // описание см. выше
        if (post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(`image${upload.id}`, `/${cfg.DESTINATION}${upload.path}`);
          });
        }

        res.render('post/post', {
          post: Object.assign(post, {
            body: converter.makeHtml(body)
          }),
          comments,
          moment,
          user: {
            id: userId,
            login: userLogin
          }
        });
      };
    } catch (error) {
      throw new Error('Server Error');
    };
  }
});

//users post
router.get('/users/:login/:page*?', async (req, res) => { //page*? означет для express необязательный параметр
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  const perPage = +cfg.PER_PAGE; //если поставить +, то прилетевшая из env строка преобразуется в числовой тип
  const page = req.params.page || 1; //если page не задана, то по умолчанию задется в строке браузера 1
  const login = req.params.login;

  try {
    const user = await models.User.findOne({
      login
    });

    let posts = await models.Post.find({
      owner: user.id
    })
    .skip(perPage * page - perPage)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
    .limit(perPage)
    .sort({ createdAt: -1 }) //вывод постов По дате (сначала самые новые)
    .populate('uploads');

    const count = await models.Post.countDocuments({
      owner: user.id
    });

    const converter = new showdown.Converter();
    posts = posts.map(post => {

      let body = post.body;

      if (post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(`image${upload.id}`, `/${cfg.DESTINATION}${upload.path}`);
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    res.render('archive/user', {
      posts,
      _user: user, //добавляем в поле _user объект user, чтобы использовать для вывода постов юзера через пагинацию
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });

  } catch (error) {
    throw new Error('Server Error');
  };
});

module.exports = router;
