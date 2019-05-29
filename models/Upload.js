const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  path: {
    type: String,
    required: true
  }
},
  {
    timestamps: true //добавляет время созданияи время обновления объекта в БД
  }
);

//Преобразование в объект JSON (чтобы использовать 'id' вместо '_id')
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Upload', schema);
