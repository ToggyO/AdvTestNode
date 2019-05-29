const express = require('express');
const router = express.Router();
const path = require('path');

//модуль для обработки изображений на сервере
const multer = require('multer');


//создание хранилища картинок для multer
const storage = multer.diskStorage({
  //определение пути сохранения картинок на сервере
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  //параметры имени файла при созранении на сервере
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
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
    }
    res.json({
      ok: !error, // ! - преобразование в тип boolean
      error
    });
  });
});

module.exports = router;
