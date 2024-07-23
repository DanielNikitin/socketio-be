const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Rank extends Model {}

Rank.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minLevel: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Rank',
  timestamps: false
});

module.exports = Rank;
