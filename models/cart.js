const path = require('path')
const fs = require('fs')
const {
    rejects
} = require('assert')
const {
    resolve
} = require('path')

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
)

class Cart {
    static async add(course) {
        const cart = await Cart.fetch()
        const idx = cart.courses.findIndex(item => item.id === course.id)
        const candidate = cart.courses[idx]

        if(candidate) {
            //course is already in cart, so need plus quantity
            candidate.count++
            cart.courses[idx] = candidate
        } else {
            // not in cart yet, will be added to cart
            course.count = 1
            cart.courses.push(course)
        }

        //+course to be sure it is number
        cart.price += +course.price

        return new Promise ((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(cart), err => {
                if(err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    static async remove(id) {
        const cart = await Cart.fetch()
        const idx = cart.courses.findIndex(item => item.id === id)
        const course = cart.courses[idx]

        if (course.count === 1) {
            ///delete
            cart.courses = cart.courses.filter(item => item.id !== id)
        } else {
            //change quantity
            cart.courses[idx].count--
        }

        //change price
        cart.price -= course.price

        return new Promise ((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(cart), err => {
                if(err) {
                    reject(err)
                } else {
                    resolve(cart)
                }
            })
        })

    }

    static async fetch() {
        return new Promise((resolve, reject) => {
            fs.readFile(p, 'utf-8', (err, content) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(content))
                }
            })
        })
    }

}

module.exports = Cart