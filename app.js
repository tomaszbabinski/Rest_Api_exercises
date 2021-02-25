const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded()); //x-www-form-urlencoded <form>

app.use(bodyParser.json()); //application/json

//GET  /feed/posts
app.use('/feed',feedRoutes);

app.listen(8080);