const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)

const keys = require('./keys')
const PORT = process.env.PORT || 3000

const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cartRoutes = require('./routes/cart')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')

const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')

const app = express()

const hbs = exphbs.create({
  defaultLayout: 'main', 
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI

})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

//MIDDLEWARE
//to use folder static, address to files in it "/name"
app.use(express.static(path.join(__dirname, 'public')))

//to use req.body
app.use(express.urlencoded({extended: true}))

//auth session
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

//for CSRF token creation and validation. This middleware adds a req.csrfToken() function to make a token which should be added to requests which mutate state, within a hidden form field, query-string etc. This token is validated against the visitor's session or csrf cookie.
app.use(csrf())

//for error messages
app.use(flash())

//my middleware
app.use(varMiddleware)
app.use(userMiddleware)

//ROUTES
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)

//connection to DB and port
async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })
    console.log(`Connected to DB successfully`)

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (err) {
    console.log(err)
  }
}

start()