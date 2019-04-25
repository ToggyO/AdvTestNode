const express = require('express');
const router = express.Router();

const cfg = require('../cfg');
const models = require('../models');

async function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  const perPage = +cfg.PER_PAGE; //если поставить +, то прилетевшая из env строка преобразуется в числовой тип
  const page = req.params.page || 1; //если page не задана, то по умолчанию задется в строке браузера 1

  try {
    const posts = await models.Post.find({})
      .skip(perPage * page - perPage)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
      .limit(perPage)
      .populate('owner') //присвоение полю owner модели Post полей из модели User
      .sort({ createdAt: -1 }) //вывод постов По дате (сначала самые новые)

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

//   models.Post.find({})
//   .skip(perPage * page - perPage)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
//   .limit(perPage)
//   .populate('owner') //присвоение полю owner модели Post полей из модели User
//   .sort({ createdAt: -1 }) //вывод постов По дате (сначала самые новые)
//   .then(posts => {
//     models.Post.countDocuments()
//     .then(count => {
//       res.render('archive/index', {
//         posts,
//         current: page,
//         pages: Math.ceil(count / perPage),
//         user: {
//           id: userId,
//           login: userLogin
//         }
//       });
//     })
//     .catch(() => {
//       throw new Error('Server Error');
//     });
//   })
//   .catch(() => {
//     throw new Error('Server Error');
//   });
// };

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
        url
      });

      if (!post) {
        const err = new Error('Not found');
        err.status = 404;
        next(err);
      } else {
        res.render('post/post', {
          post,
          user: {
            id: userId,
            login: userLogin
          }
        });
      };
    } catch (error) {
      throw new Error('Server Error');
    };


    // models.Post.findOne({
    //   url
    // })
    // .then(post => {
    //   if (!post) {
    //     const err = new Error('Not found');
    //     err.status = 404;
    //     next(err);
    //   } else {
    //     res.render('post/post', {
    //       post,
    //       user: {
    //         id: userId,
    //         login: userLogin
    //       }
    //     });
    //   }
    // })
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

    const posts = await models.Post.find({
      owner: user.id
    })
    .skip(perPage * page - perPage)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
    .limit(perPage)
    .sort({ createdAt: -1 }); //вывод постов По дате (сначала самые новые)

    const count = await models.Post.countDocuments({
      owner: user.id
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

  // models.User.findOne({
  //   login
  // })
  // .then(user => {
  //   models.Post.find({
  //     owner: user.id
  //   })
  //   .skip(perPage * page - perPage)  //ЗАГУГЛИТЬ ПРО ПАГИНАЦИЮ
  //   .limit(perPage)
  //   .sort({ createdAt: -1 }) //вывод постов По дате (сначала самые новые)
  //   .then(posts => {
  //     models.Post.countDocuments({
  //       owner: user.id
  //     }).then(count => {
  //       res.render('archive/user', {
  //         posts,
  //         _user: user, //добавляем в поле _user объект user, чтобы использовать для вывода постов юзера через пагинацию
  //         current: page,
  //         pages: Math.ceil(count / perPage),
  //         user: {
  //           id: userId,
  //           login: userLogin
  //         }
  //       });
  //     })
  //     .catch(() => {
  //       throw new Error('Server Error');
  //     })
  //     .catch(() => {
  //       throw new Error('Server Error');
  //     });
  //   });
  // });
});

module.exports = router;
