const User = require('./user.js')
module.exports = (sequelize, DataTypes) => {

    const Otp = sequelize.define("trk_otp", {
        otp:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: true
        }
    })
    
    // Otp.user_id = Otp.belongsTo(User)
    return Otp
}