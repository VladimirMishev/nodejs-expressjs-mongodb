const express = require('express');

const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

const db = require('../data/database');

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const posts = await db.getDb().collection('posts').find().project({title: 1, summary: 1, 'author.name': 1}).toArray();

  res.render('posts-list', {posts: posts});
});

router.post('/posts', async function(req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db.getDb().collection('authors').findOne({_id: authorId});

  const inputData = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  }

  await db.getDb().collection('posts').insertOne(inputData);

  res.redirect('/posts');
});

router.get('/posts/:id', async function(req, res) {
  let postId;

  try {
    postId = new ObjectId(req.params.id);    
  } catch(error) {
    return res.status(404).render('404');
  }

  const post = await db.getDb().collection('posts').findOne({_id: postId});

  res.render('post-detail', {post: post});
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();

  res.render('create-post', {authors: authors});
});

router.get('/edit-post/:id', async function(req, res) {
  let postId;

  try {
    postId = new ObjectId(req.params.id);
  } catch(error) {
    return res.status(404).render('404');
  }
  const post = await db.getDb().collection('posts').findOne({_id: postId}, {title: 1, summary: 1, body: 1});

  res.render('update-post', {post: post});
});

router.post('/edit-post/:id', async function(req, res) {
  let postId;

  try {
    postId = new ObjectId(req.params.id);
  } catch(error) {
    return res.status(404).render('404');
  }
  await db.getDb().collection('posts').updateOne({_id: postId}, {$set: {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content
  }});

  res.redirect('/posts');
});

router.post('/delete-post/:id', async function(req, res) {
  let postId;

  try {
    postId = new ObjectId(req.params.id);
  } catch(error) {
    return res.status(404).render('404');
  }

  await db.getDb().collection('posts').deleteOne({_id: postId});

  res.redirect('/posts');
});

module.exports = router;