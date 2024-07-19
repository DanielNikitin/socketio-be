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
    console.log('DB :: Connection successfully.');

    // Синхронизация всех моделей
    await sequelize.sync();

    console.log('DB :: All models synchronized.');
  } catch (error) {
    console.error('DB :: Unable to connect to the database:', error);
  }
}

// Вызываем функцию синхронизации при подключении
syncDatabase();

module.exports = sequelize;
