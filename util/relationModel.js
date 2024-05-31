
module.exports = (db) => {
    db.expense.belongsTo(db.users, { foreignKey: 'user_id' });
    db.expense.belongsTo(db.account, { foreignKey: 'account_id' });
    db.expense.belongsTo(db.category, { foreignKey: 'category_id' });
}

