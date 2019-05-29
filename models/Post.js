const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const URLSlugs = require('mongoose-url-slugs');
const tr = require('transliter');

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    required: true,
    default: 'published'
  },
  commentCount: {
    type: Number,
    default: 0
  }
},
  {
    timestamps: true //добавляет время созданияи время обновления объекта в БД
  }
);


//метод для подсчета количества комментариев у поста
//this.findByIdAndUpdate обращение к схеме и спользование метода для инкрементирования поля commentCount
schema.statics = {
  incCommentCount(postId) {
    return this.findByIdAndUpdate(
      postId,
      //Станадартная функция MongoDB для инкрементирования (см. документацию)
      { $inc: {commentCount: 1} },
      { new: true }
    );
  }
}

schema.pre('save', function(next) {
  // Преобразует title поста в url. За уникальность url отвечает Date.now().toString(36). 36 это английский язык.
  this.url = `${tr.slugify(this.title)}-${Date.now().toString(36)}`;
  next();
});

//mongoose-url-slugs преобразовывает строку заголовка поста
//в url для вставки в роут на сайте.
//transliter позволяет mongoose-url-slugs работать с unicode.
// UPD: не обновляет url при редактировании поста. Убран из проекта
// schema.plugin(
//   URLSlugs('title', {
//     field: 'url',
//     generator: text => tr.slugify(text)
//   })
// );

//Преобразование в объект JSON (чтобы использовать 'id' вместо '_id')
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', schema);
