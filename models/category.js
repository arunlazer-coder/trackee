const User = require('./user.js')
module.exports = (sequelize, DataTypes) => {

    const Category = sequelize.define("trk_category", {
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
    
    return Category
}