// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Синхронизируем модели с базой данных
async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Синхронизация всех моделей
    await sequelize.sync();

    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Вызываем функцию синхронизации при подключении
syncDatabase();

module.exports = sequelize;
