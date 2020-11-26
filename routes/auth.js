const {Router} = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const router = Router()

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
            res.redirect('/auth/login#login')
        }
    } catch(err) {
        console.log(err)
    }
})

module.exports = router