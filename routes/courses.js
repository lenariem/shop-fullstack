const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString() 
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().lean()
      .populate('userId', 'email name')
      .select('price title img')

    res.render('courses', {
    title: 'Courses',
    isCourses: true,
    userId: req.user ? req.user._id.toString() : null,
    courses
  })
  } catch (err) {
    console.log(err)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean()
    res.render('course', {
      layout: 'empty',
      title: `Course ${course.title}`,
      course
    })
  } catch (err) {
    console.log(err)
  }
})

//edit courses
router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  try {
    const course = await Course.findById(req.params.id).lean()

    //to protect router
    if(!isOwner(course, req)) {
      return res.redirect('/courses')
    }
  
    res.render('course-edit', {
      title: `Edit ${course.title}`,
      course
    })
  } catch(err) {
    console.log(err)
  }
  
})

//save edited course
router.post('/edit', auth, async (req, res) => {

  try {
    const {id} = req.body
    delete req.body.id
    const course = await Course.findById(id)
    
    if(!isOwner(course, req)) {
      return res.redirect('/courses')
    }
    Object.assign(course, req.body)
    await course.save()
    await Course.findByIdAndUpdate(id, req.body).lean()
    res.redirect('/courses')
  } catch (err) {
    console.log(err)
  }
  
})

//delete course
router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id
    }).lean()
    res.redirect('/courses')
  } catch (err) {
    console.log(err)
  }
})

module.exports = router