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
  }
},
  {
    timestamps: true //добавляет время созданияи время обновления объекта в БД
  }
);

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
