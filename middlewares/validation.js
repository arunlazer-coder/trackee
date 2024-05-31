const { check, body } = require('express-validator')
const notEmpty = (key) => {
    return key.map((element) => {
        let title = element.t || element
        let param = element.p || element
        return check(param, `${title} is required`).not().isEmpty()
    })
}

exports.expenseVal = [
    ...notEmpty(['amount', 'type', 'category_id', 'isCredit']),
]

exports.registerVal = [
    ...notEmpty([
        { t: 'user name', p: 'user_name' },
        'password',
        'dob',
        'gender',
        'password',
        'country'
    ]),
    check('user_name', 'Please include a valid email')
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: true }),
    check('user_name').exists(),
    check('password', 'Password must be 6 or more characters').isLength({
        min: 6,
        max: 20,
    }),
    check('dob', 'Invalid Date Please use YYYY-MM-DD ').isISO8601().toDate(),
]

exports.loginVal = [
    //  notEmpty(['user_name', 'password']),
    check('password', 'Password must be 6 or more characters').isLength({
        min: 6,
    }),
]
