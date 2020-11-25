const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cartRoutes = require('./routes/cart')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const User = require('./models/user')
const varMiddleware = require('./middleware/variables')

const app = express()

/* const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}) */

const hbs = exphbs.create({
  defaultLayout: 'main', 
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

//MIDDLEWARE
//to have always active user with given id
app.use(async(req, res, next) => {
  try {
    const user = await User.findById('5fbbde6f5fe9bb4b600f7dfb')
    req.user = user
    next()
  } catch(err) {
    console.log(err)
  }
})

//to use folder static, address to files in it "/name"
app.use(express.static(path.join(__dirname, 'public')))

//to use req.body
app.use(express.urlencoded({
  extended: true
}))

//auth session
app.use(session({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false
}))

app.use(varMiddleware)

//ROUTES
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000

//connection to DB and port
async function start() {
  try {
    const url = `mongodb+srv://new_user1:pamTARs84L@cluster0.uiclr.mongodb.net/courses_shop`
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })
    console.log(`Connected to DB successfully`)

    const candidate = await User.findOne()
    if(!candidate) {
      const user = new User({
        email: "user1@mail.com",
        name: "User1",
        cart: {items: []}
      })
      await user.save()
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (err) {
    console.log(err)
  }
}

start()