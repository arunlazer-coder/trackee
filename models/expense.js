module.exports = (sequelize, DataTypes) => {
    const Expense = sequelize.define('trk_expense', {
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transcationDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        moneyType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isCredit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    })

    return Expense
}
