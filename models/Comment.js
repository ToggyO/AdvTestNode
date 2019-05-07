const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const autopopulate = require('mongoose-autopopulate');

const Post = require('./Post');

const schema = new Schema({
  body: {
    type: String,
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      autopopulate: true
    }
],
  createdAt: {
    type: Date,
    default: Date.now
  }
},
  {
    timestamps: false //добавляет время созданияи время обновления объекта в БД
  }
);


//Перед созданием нового комментария количество комментариев у поста пересчитывается
//и инкрементируется с помощью функции incCommentCount.
//При созданиии объекта на основе модели у нее создается поле isNew
//Если модель создалась, то можно проверить по этому полю, чтобы
//метод pre сработал только при создании коммента, не при сохранении
schema.pre('save',  async function(next) {

  if (this.isNew) {
    //console.log(this.post);
    await Post.incCommentCount(this.post);
  }
  next();
})

schema.plugin(require('mongoose-autopopulate'));

//Преобразование в объект JSON (чтобы использовать 'id' вместо '_id')
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Comment', schema);
