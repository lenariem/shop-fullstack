const {Router} = require('express')
const User = require('../models/user')
const router = Router()

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        
        if (candidate) {
            const checkPassword = password === candidate.password
            
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
                res.redirect('/auth/login#login')
            }
        } else {
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
            res.redirect('/auth/login#register')
        } else {
            const user = new User({ email, name, password, cart: {items: []} })
            await user.save()
            res.redirect('/auth/login#login')
        }
    } catch(err) {
        console.log(err)
    }
})

module.exports = router