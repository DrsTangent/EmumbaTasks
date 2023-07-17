const Sequelize = require('sequelize');
const dbConfig = require('../../config/dbConfig.js');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }

})

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.js")(sequelize, Sequelize);
db.tasks = require("./task.js")(sequelize, Sequelize);
db.refreshTokens = require("./refreshToken.js")(sequelize, Sequelize);

module.exports = db;