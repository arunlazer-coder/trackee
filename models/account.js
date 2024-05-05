module.exports = (sequelize, DataTypes) => {

    const Account = sequelize.define("trk_user_account", {
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })
    
    return Account
}