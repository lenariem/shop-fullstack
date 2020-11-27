const keys = require('../keys')

module.exports = function (user_email) {
    return {
        to: user_email,
        from: keys.EMAIL_FROM,
        subject: 'Registration is successful. Your account is created',
        html: `
            <h1>Welcome to our shop!</h1>
            <p>You created account successfully with email - ${user_email}!</p>
            <hr>
            <a href="${keys.BASE_URL}">Courses-shop</a>
        `
    }

}