module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define("trk_users", {
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    })

    return User
}