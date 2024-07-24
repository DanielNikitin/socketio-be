const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Item extends Model {}

Item.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Item',
  timestamps: false
});

module.exports = Item;
