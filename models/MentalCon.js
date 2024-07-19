const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class MentalCon extends Model {}

MentalCon.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'MentalCon',
  timestamps: false
});

module.exports = MentalCon;
