const { validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


exports.singup = async (req,res,next) => {
 

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try {
    const hashedPw = await bcrypt.hash(password,12);
    const user = new User({
        email: email,
        password: hashedPw,
        name: name
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created', userId : result._id})
    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try{
    const user = await User.findOne({email: email})
        if(!user){
            const error = new Error('A user with that email cannot be found'); 
            error.statusCode = 401;
            throw error;
        }    
        loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password)
    if(!isEqual){
        const error = new Error('Wrong password')
        error.statusCode = 401;
        throw error;
    }
    const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
    },'supersecret',
    {expiresIn: '1h'}
    );
    res.status(200).json({token: token, userId: loadedUser._id.toString()})
    } catch (err){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error)
    }
}

exports.getUserStatus = async (req,res,next) => {
    try {
    const user = await User.findById(req.userId)
    if(!user){
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        message: 'Status found',
        status: user.status
    });
    } catch (err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updateUserStatus = async (req, res, next) => {
    const newStatus = req.body.status;

    try {
    const user = await User.findById(req.userId)
    if(!user){
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    user.status = newStatus;
    const result = await user.save();
    res.status(200).json({
        message: 'status updated'
    });
    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}