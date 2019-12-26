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

  // TODO: Rename this to SerializedRunningState to avoid confusion
  models.SerializedRunningStates = sequelize.define('serializedRunningStates', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    timestamp: { type: Sequelize.BIGINT },
    pendingLogics: { type: Sequelize.TEXT },
    currentLogic: { type: Sequelize.TEXT }
  })
  models.SerializedRunningStates.belongsTo(models.User)

  models.SerializedFrontendResponse = sequelize.define('serializedFrontendResponse', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    timestamp: { type: Sequelize.BIGINT },
    value: { type: Sequelize.TEXT }
  })

  return models
}

module.exports = addTables
