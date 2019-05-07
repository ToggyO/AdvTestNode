const express = require('express');
const router = express.Router();

const models = require('../models');

// POST for add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) { //если user не авторизован, то будет редирект на главную
    res.json({
      ok: false
    });
  } else {
    const post = req.body.post;
    const body = req.body.body;
    const parent = req.body.parent;

    // if (!body) {
    //   res.json({
    //     ok: false,
    //     error: "Пустой комментарий"
    //   });
    // }

    try {
      if (!parent) {
        await models.Comment.create({
          post,
          body,
          owner: userId
        });
          res.json({
            ok: true,
            body,
            login: userLogin
          });
      } else {
        const parentComment = await models.Comment.findById(parent);

        if (!parentComment) {
          res.json({
            ok: false
          });
        } else {
          const comment = await models.Comment.create({
            post,
            body,
            parent,
            owner: userId
          });

          //конструкция для создания чайлд-коммента у родительского
          //комментария. Занесение массива children из модели comment
          //в переменную children. С помощью push добавление комментария в массив children
          //Обратное присвоение массива children переменной children и сохранение массива children-комментариев
          //в базе данных
          const children = parentComment.children;
          children.push(comment.id);
          parentComment.children = children;
          await parentComment.save();

          res.json({
            ok: true,
            body,
            login: userLogin
          });
        }
      }
    } catch (error) {
      res.json({
        ok: false
      });
    }
  }
});

module.exports = router;
