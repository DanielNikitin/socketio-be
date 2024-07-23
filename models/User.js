const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class User extends Model {}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  respectCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  rank: {
    type: DataTypes.STRING,
    defaultValue: 'Салага'
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: false
});

module.exports = User;
