const {Router} = require('express')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const sgMail = require('@sendgrid/mail')
const User = require('../models/user')
const keys = require('../keys')
const reqEmail = require('../emails/registration')
const router = Router()


/* const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY }
})) */

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
router.post('/register', async(req, res) => {
    try {
        const {email, password, repeat, name} = req.body
        const candidate = await User.findOne({email})

        if (candidate) {
            req.flash('registrationError', 'User with this email already exists')
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({ email, name, password: hashPassword, cart: {items: []} })
            await user.save()
            
            //better after redirect
            //await transporter.sendMail(reqEmail(email))
            sgMail
                .send(reqEmail(email))
                .then(() => {
                    console.log('Email sent')
                    res.redirect('/auth/login#login')
                })
                .catch((error) => {
                    console.error(error)
                })
            
        }
    } catch(err) {
        console.log(err)
    }
})

module.exports = router