const { user, otp, category, expense, account } = require('../models')
const { DataTypes } = require('sequelize')

module.exports = (db, dbSetup) => {
    db.user = user(dbSetup, DataTypes)
    db.otp = otp(dbSetup, DataTypes)
    db.category = category(dbSetup, DataTypes)
    db.expense = expense(dbSetup, DataTypes)
    db.account = account(dbSetup, DataTypes)
}
