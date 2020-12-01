const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('name')
        .trim()
        .isLength({min:2, max: 16})
        .withMessage('Name should has at least two characters'),
    body('email', 'Please, enter a valid email')
        .isEmail()
        .trim()
        .custom(async(value, {req}) => {
            try {
                const user = await User.findOne({email: value})
                if(user) {
                    return Promise.reject('A user with this email address already exists')
                }
            } catch (err) {
                console.log(err)
            }
        }),
    body('password')
        .trim()    
        .isLength({min:6, max: 16}).withMessage('Password not less than 6 characters please')
        .matches(/\d/).withMessage('Your password should have at least one number'),
    body('confirm')
        .trim()
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Passwords must match')
            }
            return true
        })
        
]