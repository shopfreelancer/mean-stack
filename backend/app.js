const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const postsRoutes = require('./routes/posts');

const uri = "mongodb+srv://mean-stack:X8oly8Uds36I2MMB@cluster0-xbs7r.mongodb.net/angular-data?retryWrites=true";
mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to db");
  })
  .catch(() => {
    console.log("Error while connecting to DB");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use('/api/posts', postsRoutes);


module.exports = app;
