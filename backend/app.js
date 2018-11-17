const express = require('express');
const bodyParser = require('body-parser');
const Post = require('./models/post');
const mongoose = require('mongoose');
const app = express();

mongoose.connect("mongodb+srv://mean-stack:X8oly8Uds36I2MMB@cluster0-xbs7r.mongodb.net/angular-data?retryWrites=true")
  .then(() => {
    console.log("Connected to db");
  })
  .catch(() => {
    console.log("Error while connecting to DB");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.post("/api/posts", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "success",
      id: createdPost._id
    });
  });
});

app.put("/api/posts/:id", (req, res, next) => {
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content
  });

  Post.updateOne({_id: req.params.id}, post).then(updatedPost => {
    console.log(updatedPost);
    res.status(200).json({
      message: "success!",
      id: updatedPost._id
    });
  });
});

app.get('/api/posts', (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: "success!",
      posts: documents
    });
  });
});

app.delete('/api/posts/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then((response) => {});
  res.status(200).json({message: "post "+req.params.id+" deleted"});
});

module.exports = app;
