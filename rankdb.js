const sequelize = require('./db');
const Rank = require('./models/Rank');

const initializeData = async () => {
  try {
    // Синхронизация базы данных
    await sequelize.sync({ force: true }); // Сброс и создание новых таблиц

    // Создание начальных данных для таблицы Rank
    await Rank.bulkCreate([
      { name: 'Салага', minLevel: 1 },
      { name: 'Сынок', minLevel: 10 },
      { name: 'Бывалый', minLevel: 20 },
      { name: 'Здравый', minLevel: 30 },
      { name: 'Старожил', minLevel: 40 },
      { name: 'Зашкваренный', minLevel: 50 },
      { name: 'Тёртый', minLevel: 60 },
      { name: 'Проверенный', minLevel: 70 },
      { name: 'Шарящий', minLevel: 80 },
      { name: 'Патриот', minLevel: 90 },
      { name: 'Отшлифованный', minLevel: 100 },
      { name: 'Ветеран', minLevel: 110 },
      { name: 'Крепкий', minLevel: 120 },
      { name: 'Старший', minLevel: 130 },
      { name: 'Сталкер', minLevel: 140 },
      { name: 'Тотем', minLevel: 150 },
    ]);

    console.log('Ranks have been created.');

  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Запуск инициализации данных
initializeData();


// node updateRankInDB.js