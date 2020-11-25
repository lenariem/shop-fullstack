const {Router} = require('express')
const router = Router()

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true
    })
})

router.post('/login', async (req, res) => {
    req.session.isAuthenticated = true,
    res.redirect('/')
})

router.get('/logout', async (req, res) => {
    /* clear session */
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

module.exports = router