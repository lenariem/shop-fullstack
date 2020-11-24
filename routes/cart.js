const {Router} = require('express')
const Course = require('../models/course')
const router = Router()

function mapCartItems(cart) {
    return cart.items.map(course => ({
        ...course.courseId._doc,
        id: course.courseId.id,
        count: course.count
    }))
}

function countPrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count
    }, 0)
}


router.post('/add', async (req, res) => {
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course) 
    res.redirect('/cart')
})

router.delete('/remove/:id', async (req, res) => {
    await req.user.removeFromCart(req.params.id)
    const user = await req.user.populate('cart.items.courseId').execPopulate()
    const courses = mapCartItems(user.cart)
    const cart = {
        courses, price: countPrice(courses)
    }
    res.status(200).json(cart)
})

router.get('/', async(req, res) => {
    const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()

    const courses = mapCartItems(user.cart)
    
    res.render('cart', {
        title: 'Your shopping cart',
        isCart: true,
        courses: courses,
        price: countPrice(courses)
    })
    
})

module.exports = router