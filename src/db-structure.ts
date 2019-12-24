import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  models.User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    didIntroduction: { type: Sequelize.BOOLEAN, defaultValue: false }
  })

  models.Company = sequelize.define('company', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true },
    employeesCount: { type: Sequelize.INTEGER }
  })
  models.Company.belongsTo(models.User)

  models.Demographics = sequelize.define('demographics', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    // Stringified JSON of the entire demographics
    value: { type: Sequelize.TEXT }
  })
  models.Demographics.belongsTo(models.User)

  models.RunningStates = sequelize.define('runningStates', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    timestamp: { type: Sequelize.BIGINT },
    pendingLogics: { type: Sequelize.TEXT },
    currentLogic: { type: Sequelize.TEXT }
  })
  models.RunningStates.belongsTo(models.User)

  return models
}

module.exports = addTables
