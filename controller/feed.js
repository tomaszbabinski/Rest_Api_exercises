const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    try{
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
                    .skip((currentPage -1) * perPage)
                    .limit(perPage);     
    
        res.status(200).json({
            message: 'Fetched posts succeeded',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
    }   
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data not correct');
        error.statusCode = 422;    
        throw error;
    }
    if(!req.file){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\","/");
    let creator;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    post.save()
        .then(result => User.findById(req.userId))
        .then(user => creator = user)
        .then(result => res.status(201).json({
                message: 'Post created successfuly',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            }))
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }) 
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                messasge: 'Post fetched.',
                post: post})
        })
        .catch(err => {
          if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });    
}

exports.updatePost = (req,res,next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data not correct');
        error.statusCode = 422;    
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image
    if(req.file){
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error('No file was picked');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;  
            }
            if(post.creator.toString() !== req.userId){
                const error = new Error('Not authorized');
                error.statusCode = 403;
                throw error;
            }
            if(imageUrl !== post.imageUrl){
               clearImage(post.imageUrl); 
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => res.status(200).json({
                message: 'Post updated',
                post: result
            }))
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deletePost = (req,res,next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;  
            }
            if(post.creator.toString() !== req.userId){
                const error = new Error('Not authorized');
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => User.findById(req.userId))
        .then(user => user.posts.pull(postId))
        .then(result => res.status(200).json({message: 'Post deleted'}))
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}

const clearImage = filePath => filePath = path.join(__dirname,'..',filePath)