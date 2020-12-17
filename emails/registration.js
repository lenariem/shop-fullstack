const keys = require('../keys')

module.exports = function (user_email) {
    return {
        to: user_email,
        from: keys.EMAIL_FROM,
        subject: 'Registration is successful. Your account is created',
        html: `
            <h1>Welcome to our platform!</h1>
            <p>You have created account successfully with email - ${user_email}!</p>
            <p>Have fun with "Owl"! </p>
            <hr />
            <a href="${keys.BASE_URL}">Courses-shop-owl</a>
        `
    }

}
