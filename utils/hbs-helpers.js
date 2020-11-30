//function to check if equal 

module.exports = {
    ifeq(a, b , options) {
        if(a==b) {
            return options.fn(this)
        } 
        return options.inverse(this)
    }
}