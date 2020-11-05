// Saving instance of Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config()
const uri = process.env.DB_CONNECTION
const port = 8080

mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology: true},() =>
  console.log('App is now connected to DB!!!')
);


const server = express()
server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Import Routes for API
const apiRoute = require('./api/project');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended:true}));

server.use('/api',apiRoute);

server.listen(port, () => {
  console.log(`App is now listening at http://localhost:${port}`)
})