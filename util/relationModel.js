module.exports = (db) => {
    db.expense.belongsTo(db.user, { foreignKey: 'user_id' })
    db.expense.belongsTo(db.account, { foreignKey: 'account_id' })
    db.expense.belongsTo(db.category, { foreignKey: 'category_id' })
    db.account.hasMany(db.expense, { foreignKey: 'account_id' });
    db.category.hasMany(db.expense, { foreignKey: 'category_id' });
}
