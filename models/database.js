const { Sequelize } = require('sequelize')
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DIALECT } = process.env
const modal = require('../util/modelConfig')
const relationShip = require('../util/relationModel')
const dbSetup = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: DIALECT,
    operatorsAliases: false,
    pool: {
        max: 5,
    },
    logging: false, // Disable logging
})

dbSetup
    .authenticate()
    .then(() => console.log('connected'))
    .catch((err) => console.log('Error: ' + err))

const db = {}
db.Sequelize = Sequelize
db.setup = dbSetup
//models will connected here
modal(db, dbSetup)

//foerign key mapping will done here
relationShip(db)

db.setup.sync({ force: false })

module.exports = db
