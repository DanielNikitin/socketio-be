const { trimStr } = require("./utils");

const TotalRespect = require('./models/TotalRespect');

const User = require('./models/User');
const Item = require('./models/Item');

const { Op } = require('sequelize');
const Rank = require('./models/Rank');

let users = [];

//// ADD USER
const addUser = async (user) => {
  const userName = trimStr(user.name);

  let dbUser = await User.findOne({ where: { name: userName } });
  if (!dbUser) {
    const userData = {
      name: userName,
      respectCount: 0,
      experiencePoints: 0,
      status: '0',
      level: 1,
      rank: 'Салага',
      items: JSON.stringify(["BtnSkin3"])
    };
    console.log("Creating user with values:", userData);
    dbUser = await User.create(userData);
    console.log(`User created in database: ${dbUser.name} ${dbUser.respectCount} ${dbUser.status} 
      ${dbUser.level} ${dbUser.rank} ${dbUser.experiencePoints}`);
  }

  const currentUser = dbUser.dataValues;

  if (!users.find(u => u.name === currentUser.name)) {
    users.push(currentUser);
  }

  return { isExist: !!dbUser, user: currentUser };
};

//// GET USERS
const getUsers = async () => {
  return users;
};


//// REMOVE USER
const removeUser = (name) => {
  const index = users.findIndex((user) => user.name === name);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//// SET USER STATUS
async function setStatus(name, status) {
  const user = users.find((user) => user.name === name);
  if (user) {
    if (user.respectCount < 100) {
      // Возвращаем ошибку, если уважений недостаточно
      return { success: false, message: 'Not enough Respect. Min 100 points required' };
    }

    // Вычитаем 100 респект поинтов
    user.respectCount -= 100;
    await User.update({ respectCount: user.respectCount, status: status }, { where: { name: name } });

    // Обновление пользователя в массиве users
    const updatedUser = await User.findOne({ where: { name: name } });
    if (updatedUser) {
      const index = users.findIndex(u => u.name === name);
      users[index] = updatedUser.dataValues;
    }

    return { success: true, user: updatedUser.dataValues };
  } else {
    console.log('User not found');
    return { success: false, message: 'User not found' };
  }
}

//// UPDATE USER LEVEL
const updateUserLevel = async (name) => {
  const user = users.find((user) => user.name === name);

  if (user) {
    const experiencePoints = user.experiencePoints;
    const newLevel = Math.floor(experiencePoints / 150) + 1;

    if (user.level < newLevel) {
      await User.update({ level: newLevel }, { where: { name: name } });

      // Определяем новый ранг на основе уровня
      const newRank = await Rank.findOne({
        where: { minLevel: { [Op.lte]: newLevel } },
        order: [['minLevel', 'DESC']]
      });

      if (newRank) {
        // Обновляем ранг пользователя
        await User.update({ rank: newRank.name }, { where: { name: name } });

        // Обновляем пользователя в массиве users
        const updatedUser = await User.findOne({ where: { name: name } });
        if (updatedUser) {
          const index = users.findIndex(u => u.name === name);
          users[index] = updatedUser.dataValues;
        }
      }
    }
  }
};

//// INCREMENT EXPERIENCE
const incrementExperience = async (name) => {
  const user = users.find((user) => user.name === name);

  if (user) {
    user.experiencePoints += 1;
    await User.update({ experiencePoints: user.experiencePoints }, { where: { name: name } });

    // Обновление уровня пользователя
    await updateUserLevel(name);

    // Обновление пользователя в массиве users
    const updatedUser = await User.findOne({ where: { name: name } });
    if (updatedUser) {
      const index = users.findIndex(u => u.name === name);
      users[index] = updatedUser.dataValues;
    }

    return updatedUser.dataValues;
  }
};

//// INCREMENT RESPECT POINTS
const incrementRespect = async (name) => {
  const user = users.find((user) => user.name === name);

  if (user) {
    user.respectCount += 1;
    await User.update({ respectCount: user.respectCount }, { where: { name: name } });

    // Обновление уровня пользователя
    await updateUserLevel(name);

    // Обновление пользователя в массиве users
    const updatedUser = await User.findOne({ where: { name: name } });
    if (updatedUser) {
      const index = users.findIndex(u => u.name === name);
      users[index] = updatedUser.dataValues;
    }

    return updatedUser.dataValues;
  }
};

//// DOUBLE RESPECT POINTS
const doubleRespect = async (name) => {
  const user = users.find((user) => user.name === name);

  if (user) {
    user.respectCount += 2;
    await User.update({ respectCount: user.respectCount }, { where: { name: name } });

    // Обновление уровня пользователя
    await updateUserLevel(name);

    // Обновление пользователя в массиве users
    const updatedUser = await User.findOne({ where: { name: name } });
    if (updatedUser) {
      const index = users.findIndex(u => u.name === name);
      users[index] = updatedUser.dataValues;
    }

    return updatedUser.dataValues;
  }
};

//// GET TOTAL RESPECT
const getTotalRespect = async () => {
  try {
    // Получаем текущее значение totalRespect из базы данных
    const dbTotalRespect = await TotalRespect.findOne();
    return dbTotalRespect ? dbTotalRespect.total : 0;
  } catch (error) {
    console.error('Error fetching totalRespect from database:', error);
    return 0;
  }
};

//// BUY ITEM
const buyItem = async (username, itemName) => {
  // Найти пользователя
  const user = users.find((user) => user.name === username);

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  // find item
  const item = await Item.findOne({ where: { name: itemName } });

  if (!item) {
    return { success: false, message: 'Item not found' };
  }

  // Check if respect is enough
  if (user.respectCount < item.price) {
    return { success: false, message: 'Not enough respect points' };
  }

  // Check if this item has already been purchased
  const userItems = JSON.parse(user.items || '[]');
  if (userItems.includes(itemName)) {
    return { success: false, message: 'Item already purchased' };
  }

  // Subtract item price from respect
  user.respectCount -= item.price;
  
  // Update user's item list
  userItems.push(itemName);
  user.items = JSON.stringify(userItems);

  // Save changes to database
  await User.update(
    { respectCount: user.respectCount, items: user.items },
    { where: { name: username } }
  );

  // Update user in users array
  const updatedUser = await User.findOne({ where: { name: username } });
  if (updatedUser) {
    const index = users.findIndex(u => u.name === username);
    users[index] = updatedUser.dataValues;
  }

  return { success: true, message: `Item ${itemName} purchased successfully` };
};

//// SET LAST SKIN
const setLastSkin = async (name, skin) => {
  const user = users.find((user) => user.name === name);

  if (user) {
    await User.update({ lastSkin: skin }, { where: { name: name } });

    // Обновление пользователя в массиве users
    const updatedUser = await User.findOne({ where: { name: name } });
    if (updatedUser) {
      const index = users.findIndex(u => u.name === name);
      users[index] = updatedUser.dataValues;
    }

    return { success: true, user: updatedUser.dataValues };
  } else {
    console.log('User not found');
    return { success: false, message: 'User not found' };
  }
};

//// GET LAST SKIN
const getLastSkin = async (name) => {
  const user = users.find((user) => user.name === name);

  if (user) {
    return user.lastSkin;
  } else {
    console.log('User not found');
    return null;
  }
};



module.exports = { addUser, getUsers, removeUser, incrementExperience, incrementRespect, 
  doubleRespect, getTotalRespect, setStatus, updateUserLevel, buyItem,
setLastSkin, getLastSkin };
