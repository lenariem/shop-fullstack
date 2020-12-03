const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator')
const sgMail = require('@sendgrid/mail')
const User = require('../models/user')
const keys = require('../keys')
const reqEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')
const router = Router()

sgMail.setApiKey(keys.SENDGRID_API_KEY)

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        loginError: req.flash('loginError'),
        registrationError: req.flash('registrationError')
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        
        if (candidate) {
            const checkPassword = await bcrypt.compare(password, candidate.password)
            
            if(checkPassword) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Wrong Password')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Email is not valid')
            res.redirect('/auth/login#login')
        }
    } catch (err) {
        console.log(err)
    }
   
})

router.get('/logout', async (req, res) => {
    /* clear session */
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})


//register new users
router.post('/register', registerValidators, async(req, res) => {
    try {
        const {email, password, name} = req.body

        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            req.flash('registrationError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({ email, name, password: hashPassword, cart: {items: []} })
            await user.save()
            
            //send mail after registration
            sgMail
                .send(reqEmail(email))
                .then(() => {
                    console.log('Email sent')
                    const successRegistr = true
                    res.redirect('/auth/login#login')
                })
                .catch((error) => {
                    console.error(error)
                })
    } catch(err) {
        console.log(err)
    }
})

//reset password
router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error')
    })
})

//set a new password
router.get('/password/:token', async(req, res) => {
    if (!req.params.token) {
        //for security if token is absent redirect
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token, 
            //check if token still valid $gt-greater than
            resetTokenExpiration: {$gt: Date.now()}
        })

        if(!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Recovery access',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch(err) {
        console.log(err)
    }
    
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if(err) {
                req.flash('error', 'Sorry, something went wrong. We are working on it. Please try one more in some minutes')
               res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})

            if (candidate) {
                candidate.resetToken = token
                //token will be expired after one hour
                candidate.resetTokenExpiration = Date.now() + 60 * 60 * 1000 
                await candidate.save()
                
                //send email
                sgMail
                .send(resetEmail(candidate.email, token))
                .then(() => {
                    console.log('Check your email')
                    res.redirect('/auth/login')
                })
                .catch((error) => {
                    console.error(error)
                })
            } else {
                req.flash('error', 'User with this email is not found')
                res.redirect('/auth/reset')
            }
        })
    } catch(err) {
        console.log(err)
    }
})


router.post('/password', async(req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExpiration: {$gt: Date.now()}
        })

        if(user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined,
            user.resetTokenExpiration = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Time for recovery is expired, please try again')
            res.redirect('/auth/login')
        }

    } catch(err) {
        console.log(err)
    }
})

module.exports = router