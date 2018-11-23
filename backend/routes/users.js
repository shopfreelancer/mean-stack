const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({message: "user registered", user: result});
        })
        .catch(err => {
          res.status(400).json({
            error: err
          })
        });
    })
});

router.post('/login', (req, res, next) => {
  User.findOne({email: req.body.password})
    .then(user => {
      if (!user) {
        return res.status(401).json({message: "Auth failed"});
      }
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if(!result) {
        return res.status(401).json({message: "Auth failed"});
      }
      const token = jwt.sign({email: user.eamail, userId: user._id},process.env.JWT_SALT, {expiresIn: '1h'});
      return res.status(200).json({message: "Success", token: token});
    })
    .catch(err => {

    })
});

module.exports = router;
