const { check, body } = require('express-validator')
const db = require('../models/database')
const { user: User } = db


const notEmpty = (key) => {
    return key.map((element) => {
        let title = element.t || element
        let param = element.p || element
        return check(param, `${title} is required`).not().isEmpty()
    })
}

exports.expenseVal = [
    ...notEmpty(['amount', 'category_id', 'account_id', 'transcationDate', 'moneyType', 'isCredit']),
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
        .normalizeEmail({ gmail_remove_dots: true })
        .custom(async (user_name) => {
            const user = await User.findOne({where:{user_name}});
            console.log(user)
            if (user) {
              throw new Error('Username already taken');
            }
            return true;
          }),
    check('password', 'Password must be 6 or more characters').isLength({
        min: 6,
        max: 20,
    }),
]

exports.loginVal = [
    //  notEmpty(['user_name', 'password']),
    check('password', 'Password must be 6 or more characters').isLength({
        min: 6,
    }),
]
