const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('name').isLength({min:2, max: 16}).withMessage('Name should have at least two characters'),
    body('email', 'Please, enter a valid email').isEmail().custom(async(value, {req}) => {
        try {
            const user = await User.findOne({email: value})
            if(user) {
                return Promise.reject('User with this email is already exists')
            }
        } catch (err) {
            console.log(err)
        }
    }),
    body('password','Please, enter at least one number and not less than 6 characters').isLength({min:6, max: 16}).isAlphanumeric(),
    body('confirm').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords must match')
        }
        return true
    })
]