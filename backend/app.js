const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

/**
 * Connect to MongoDB
 * @type {string}
 */
const uri = process.env.MONGO_CONNECTION;
mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to db");
  })
  .catch(() => {
    console.log("Error while connecting to DB");
  });

/**
 * Remove deprecation warning without indexes
 * https://github.com/Automattic/mongoose/issues/6890
 */
mongoose.set('useCreateIndex', true);

/**
 * Attach middlewares
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images', express.static(path.join('backend/images')));

/**
 * Set headers and handle CORS
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

/**
 * Add actual routes
 */
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

module.exports = app;
