const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const fileMiddleware = require('../middleware/file');
const PostController = require('../controllers/post');

router.post(
  '',
  authMiddleware,
  fileMiddleware,
  PostController.createPost
);

router.put('/:id',
  authMiddleware,
  fileMiddleware,
  PostController.updatePost
  );

router.get('', PostController.fetchPosts);

router.get('/:id', PostController.fetchPost);

router.delete('/:id', authMiddleware, PostController.deletePost);

module.exports = router;
