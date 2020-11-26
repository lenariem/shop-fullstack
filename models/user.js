const {Schema,model} = require('mongoose')
const course = require('./course')

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: String,
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      count: {
        type: Number,
        required: true,
        default: 1
      },
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      }
    }]
  }
})


userSchema.methods.addToCart = function (course) {
  let items = [...this.cart.items]
  let idx = items.findIndex(c => {
    //if use type: Schema.Types.ObjectId => .toString()
    return c.courseId.toString() === course._id.toString()
  })

  //if course is already in a cart
  if (idx >= 0) {
    items[idx].count = items[idx].count + 1
  //if course is not in a cart
  } else {
    items.push({
      courseId: course._id,
      count: 1
    })
  }

  this.cart = {items}
  return this.save()
}


userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items]
  let idx = items.findIndex(c => c.courseId.toString() === id.toString())
  if (items[idx].count === 1) {
    items = items.filter(c => c.courseId.toString() !== id.toString())
  } else {
    items[idx].count--
  }

  this.cart = {
    items
  }
  return this.save()
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []}
  return this.save()
}

module.exports = model('User', userSchema)