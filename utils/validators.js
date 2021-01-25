const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('name')
        .trim()
        .isLength({min:2, max: 30})
        .withMessage('Name should have at least two characters and not more than 30'),
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


exports.courseValidators = [
    body('title')
        .isLength({min: 3}).withMessage('Title is too short, please enter at least 3 characters')
        .isLength({max: 175}).withMessage('Title is too long, please 175 characters maximum'),
    body('price')
        .isNumeric().withMessage('Price must be a number')
        .isLength({max: 6}).withMessage('Price is too long, please 6 numbers maximum'),
    body('img', 'Please enter a valid url')
        .isURL(),
    body('theme')
        .isLength({min: 2}).withMessage('Topic is too short, please enter at least 2 characters')
        .isLength({max: 80}).withMessage('Topic is too long, please 80 characters maximum')
]

