const faker = require('faker');
const tr = require('transliter');
// const TurndownService = require('turndown'); // убран из проекта

const models = require('./models');

const owner = '5cbd947d7f39511ca8a988e3';

module.exports = async () => {
  try {
    await models.Post.deleteOne();

    Array.from({length: 20}).forEach(async () => {
      const title = faker.lorem.words(5);
      const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
      const post = await models.Post.create({
        title,
        body: faker.lorem.words(100),
        url,
        owner
      });
      console.log(post);
    });
  } catch (error) {
    console.log(error);
  }
};