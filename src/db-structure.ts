import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  models.Company = sequelize.define('company', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true },
    employeesCount: { type: Sequelize.INTEGER }
  })

  models.User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
  })
  models.User.belongsTo(models.Company)

  models.Demographics = sequelize.define('demographics', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING }
  })
  models.Demographics.belongsTo(models.User)

  return models
}

module.exports = addTables
