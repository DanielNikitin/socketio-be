// models/TotalRespect.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class TotalRespect extends Model {}

TotalRespect.init({
  total: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'TotalRespect',
  timestamps: false
});

module.exports = TotalRespect;
