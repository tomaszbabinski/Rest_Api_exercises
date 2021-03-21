const express = require('express');
const {body} = require('express-validator')
const User  = require('../models/user');
const isAuth = require('../middleware/is-auth');
const authController = require('../controller/auth');
const router = express.Router();

router.put('/signup',[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => {
            return User
                    .findOne({email: value })
                    .then(userDoc => {
                        if(userDoc){
                        return Promise.reject('Email address already exists');
                        }
                    });
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({min: 5}),
    body('name')
        .trim()
        .not()
        .isEmpty()
], authController.singup);

router.post('/login',authController.login);

router.patch('/status',isAuth, [
    body('status').trim().not().isEmpty()
],authController.updateUserStatus)

router.get('/status', isAuth, authController.getUserStatus);

module.exports = router;