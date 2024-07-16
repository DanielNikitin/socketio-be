// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  respectCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = User;
