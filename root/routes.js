const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


router.get('/', (req,res) => {
  Post.find({}).then(posts => {
    res.render('index', {posts: posts});
  });
});

router.get('/create', (req,res) => {
  res.render('create');
});

router.post('/create', async (req,res) => {
  const postData = {
    title: req.body.title,
    body: req.body.body
  };
  const post = new Post(postData);
  await post.save(() => console.log("Post # " + post.id + " successfully created"));
  res.redirect('/');

  // const {title, body} = req.body;
  // Post.create({
  //   title: title,
  //   body: body
  // }).then(post => console.log(post._id));
  // res.redirect('/');
});



module.exports = router;
