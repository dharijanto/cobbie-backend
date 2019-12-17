const Sequelize = require('sequelize')

function addTables (sequelize, models) {
  // models.User = sequelize.define('User', ...)

  models.Company = sequelize.define('company', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true },
    employeesCount: { type: Sequelize.INTEGER }
  })

  models.User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true },
    employeesCount: { type: Sequelize.INTEGER }
  })
  models.User.belongsTo(models.Company)

  models.Demographics = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true },
  })
  models.Demographics.belongsTo(models.User)


  return models
}

module.exports = addTables
