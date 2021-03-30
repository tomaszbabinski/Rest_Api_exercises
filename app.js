const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();
const MONGODB_URI = 'mongodb+srv://tommybab_node:i3USmkwJ0b8clDGJ@cluster0.edvp1.mongodb.net/messages?retryWrites=true&w=majority';
// app.use(bodyParser.urlencoded()); //x-www-form-urlencoded <form>

const fileStorage =  multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});
const fileFilter = (req,file,cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
        )
    {
        cb(null,true);
    } else {
        cb(null,false);
    }
};
app.use(bodyParser.json()); //application/jsonx
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images',express.static(path.join(__dirname,'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//GET  /feed/posts
app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500; 
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});

})

mongoose.connect(MONGODB_URI)
        .then(result => {
            const server = app.listen(8080);
            const io = require('socket.io')(server);
            io.on('connection',socket => {
                console.log('Client connected');
            });
        })
        .catch(err=> {
            console.log(err);
        });
 
