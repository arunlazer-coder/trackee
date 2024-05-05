module.exports = (sequelize, DataTypes) => {

    const Category = sequelize.define("trk_user_category", {
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
    
    return Category
}