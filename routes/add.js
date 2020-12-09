const {Router} = require('express')
const {validationResult} = require('express-validator')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')
const router = Router()


router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
})

router.post('/', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Add course',
      isAdd: true,
      error: errors.array()[0].msg,
      //if error in one field, fields already filled correctly will keep data
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        theme: req.body.theme
      }
    })
  }

  //const author = await req.user.populate('name').execPopulate() 
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    author: req.user.name,
    theme: req.body.theme,
    userId: req.user
  })

  try {
    await course.save()
    res.redirect('/courses')
  } catch(err) {
    console.log(err)
  }
})

module.exports = router