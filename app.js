const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const feedRoutes = require('./routes/feed');

const app = express();
const MONGODB_URI = 'mongodb+srv://tommybab_node:i3USmkwJ0b8clDGJ@cluster0.edvp1.mongodb.net/messages?retryWrites=true&w=majority';
// app.use(bodyParser.urlencoded()); //x-www-form-urlencoded <form>

app.use(bodyParser.json()); //application/jsonx
app.use('/images',express.static(path.join(__dirname,'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//GET  /feed/posts
app.use('/feed',feedRoutes);

mongoose.connect(MONGODB_URI)
        .then(result => {
            app.listen(8080);
        })
        .catch(err=> {
            console.log(err);
        });

