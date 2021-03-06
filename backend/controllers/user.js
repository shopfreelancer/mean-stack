const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({ message: 'User registered', user: result });
        })
        .catch(err => {
          res.status(400).json({ message: 'Invalid validation credentials.'  })
        });
    })
};

exports.loginUser = (req, res, next) => {
  let fetchedUser;
  User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        return false;
      }
      fetchedUser = user;
      return bcrypt.compareSync(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({ message: 'Auth failed' });
      }
      const token = jwt.sign({
        email: fetchedUser.email,
        userId: fetchedUser._id
      }, process.env.JWT_SALT, {expiresIn: '1h'});
      res.status(200).json({ message: 'Successfully logged in', token: token, expiresIn: 3600, userId: fetchedUser._id });
    })
    .catch(err => {
      return res.status(401).json({ message: 'Auth failed' });
    })
};
