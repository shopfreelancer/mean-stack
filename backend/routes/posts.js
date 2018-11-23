const express = require('express');
const Post = require('../models/post');
const router = express.Router();
const multer = require('multer');
const AuthMiddleware = require('../middleware/auth');

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

router.post(
  '',
  AuthMiddleware,
  multer({storage: storage}).single('image'),
  (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename, // filename from multer
    userId: req.userData.userId
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

router.put('/:id',
  AuthMiddleware,
  multer({storage: storage}).single('image'),
  (req, res, next) => {
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
  Post.updateOne({_id: post.id, userId: req.userData.userId}, post).then(result => {
    if(result.nModified > 0) {
      res.status(200).json({message: "success!"});
    } else {
      res.status(401).json({message: "Not authorized!"});
    }
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

router.delete('/:id', AuthMiddleware, (req, res, next) => {
  Post.deleteOne({_id: req.params.id, userId: req.userData.userId}).then(result => {
    if(result.n > 0) {
      res.status(200).json({message: "Success!"});
    } else {
      res.status(401).json({message: "Not authorized!"});
    }
  });
});


module.exports = router;
