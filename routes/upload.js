const express = require('express');
const router = express.Router();
const path = require('path');
const Sharp = require('sharp'); // сжимает картинки (работает с потоками)
const mkdirp = require('mkdirp'); // создает иерархию из папок

const cfg = require('../cfg');
const diskStorage = require('../utils/diskStorage');
const models = require('../models');

//модуль для обработки изображений на сервере
const multer = require('multer');

const rs = () => Math.random().toString(36).slice(-3);

//создание хранилища картинок для multer
const storage = diskStorage({
  //определение пути сохранения картинок на сервере
  destination: (req, file, cb) => {
    const dir = '/' + rs() + '/' + rs();
    req.dir = dir;

    mkdirp(cfg.DESTINATION + dir, err => cb(err, cfg.DESTINATION + dir));
    // cb(null, cfg.DESTINATION + dir);
  },
  //параметры имени файла при созранении на сервере
  filename: async (req, file, cb) => {
    //для записи в БД
    const userId = req.session.userId; //получаем id юзера для поиска в бд
    const fileName = Date.now().toString(36) + path.extname(file.originalname); //создаем им файла, которое будет дано после записи
    const dir = req.dir; // путь ????
    console.log(req.body); // { postId: '5cee5941c8e77a0abc38e77c' }

    // find post
    const post = await models.Post.findById(req.body.postId);
    if (!post) {
      const err = new Error('No Post!');
      err.code = "NOPOST";
      return cb(err);
    }

    const upload = await models.Upload.create({
      owner: userId,
      path: dir + '/' + fileName
    });

    // write to post on DB
    const uploads = post.uploads;
    uploads.unshift(upload.id); //push добавить в конец массива, unshift в конец
    post.uploads =  uploads;
    await post.save();

    //
    req.filePath = dir + '/' + fileName;

    cb(null, fileName);
  },
  sharp: (req, file, cb) => {
    //max обрезка картинки по большей стороне
    //withoutEnlargement если картинка меньше заданного разрешения, то она не будет натянута до заданного разрешения
    const resizer =
      Sharp()
        .resize({
          width: 1024,
          height: 768,
          withoutEnlargement: true
        })
        .toFormat('jpg')
        .jpeg({
          quality: 40,
          progressive: true
        })
        // .composite([{
        //   blend: 'dest-in'
        // }])
        // .png();
    cb(null, resizer);
  }
});

//Описание параметров самого multera
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, //допустимый размер загружаемого файла
  //Задаем допустимое для загрузки расширение файла
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      const err = new Error('Extention');
      err.code = "EXTENTION";
      return cb(err);
    } else {
      cb(null, true)
    }
  }
}).single('file'); //указываем, что больше одного файла заружать нельзя для input с name='file'

//POST is upload
router.post('/image', (req, res) => {
  upload(req, res, err => {
    let error = '';

    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE')  {  //LIMIT_FILE_SIZE - заголовок огибки из документации
        error = "Картинка не более 2мб!"
      }
      if (err.code === 'EXTENTION')  {
        error = "Только jpg/jpeg и png!";
      }
      if (err.code === 'NOPOST')  {
        error = "Обнови страницу!";
      }
    }
    res.json({
      ok: !error, // ! - преобразование в тип boolean
      error,
      filePath: req.filePath //отправляем путь картинки, находящийся в БД, клиенту
    });
  });
});

module.exports = router;
