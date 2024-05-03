module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define("trk_expense", {
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        transcationDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        moneyType:{
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isCredit:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    })

    return User
}