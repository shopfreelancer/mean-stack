const express = require('express');
const Post = require('../models/post');
const router = express.Router();
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValidMimeType = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime Type");

    if(isValidMimeType){
      error = null;
    }

    // path relative to server.js
    cb(null, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('', multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename, // filename from multer
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "success",
      post: {
        ...createdPost,
        id: createdPost._id,
      }
    });
  });
});

router.put('/:id', multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({_id: post.id}, post).then(updatedPost => {
    res.status(200).json({
      message: "success!",
      id: updatedPost._id
    });
  });
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
    res.status(200).json({
      message: "success!",
      posts: fetchedPosts,
      totalPosts: count,
    });
  });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(405).json({ message: "Post not found"});
    }
  });
});

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then((response) => {
  });
  res.status(200).json({message: "post " + req.params.id + " deleted"});
});


module.exports = router;
