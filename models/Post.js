const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');
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
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

//mongoose-url-slugs преобразовывает строку заголовка поста
//в url для вставки в роут на сайте.
//transliter позволяет mongoose-url-slugs работать с unicode.
schema.plugin(
  URLSlugs('title', {
    field: 'url',
    generator: text => tr.slugify(text)
  })
);

//Преобразование в объект JSON (чтобы использовать 'id' вместо '_id')
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', schema);
