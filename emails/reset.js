const keys = require('../keys')

module.exports = function(user_email, token) {
    return {
        to: user_email,
        from: keys.EMAIL_FROM,
        subject: 'Recovery your password on courses-shop.com',
        html: `
            <h1>Forgot your password?</h1>
            <p>If no, please ignore this letter</p>
            <p>If you want to recovery your password, please click this link</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Recovery your password</a></p>
            <hr />
            <a href="${keys.BASE_URL}">Courses-shop</a>
        `
    }
}