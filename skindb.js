const sequelize = require('./db');
const ButtonSkins = require('./models/ButtonSkins');

const initializeData = async () => {
  try {
    await sequelize.sync();

    await ButtonSkins.bulkCreate([
      { name: 'Skin1', price: 100, imageUrl: '/images/Skin1.jpg' },
      { name: 'Skin2', price: 100, imageUrl: '/images/Skin2.jpg' },
    ], { ignoreDuplicates: true });

    console.log('Button skins have been created.');

  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

initializeData();
