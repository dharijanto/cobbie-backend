import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  models.Product = sequelize.define('Product', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true },
    category: { type: Sequelize.INTEGER },
    origin: { type: Sequelize.TEXT },
    description: Sequelize.TEXT,
    price: Sequelize.INTEGER,
    stock: Sequelize.INTEGER,
    weight: Sequelize.INTEGER,
    showcase: Sequelize.STRING,
    status: Sequelize.ENUM(['Stok Tersedia', 'Stok Kosong'])
  })

  return models
}

module.exports = addTables
