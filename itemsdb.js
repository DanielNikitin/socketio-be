const sequelize = require('./db');
const Item = require('./models/Item');
const initializeData = async () => {
  try {
    // Синхронизация базы данных (создание таблицы если не существует)
    await sequelize.sync({ force: true });

    // Создание начальных данных для таблицы Item
    await Item.bulkCreate([
      { name: 'DoubleRespect', price: 100, imageUrl: '/images/Skin2.jpg'},
      { name: 'Robbery', price: 100, imageUrl: '' },
      { name: 'BtnSkin', price: 100, imageUrl: 'http://localhost:3009/images/Skin3.jpg' },
      { name: 'BtnSkin2', price: 100, imageUrl: 'http://localhost:3009/images/Skin3.jpg' },
      { name: 'BtnSkin3', price: 100, imageUrl: 'http://localhost:3009/images/Skin4.jpg' },
    ]);

    console.log('Items have been created.');

  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Запуск инициализации данных
initializeData();
