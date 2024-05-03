module.exports = (sequelize, DataTypes) => {

    const Account = sequelize.define("trk_account", {
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
    
    return Account
}