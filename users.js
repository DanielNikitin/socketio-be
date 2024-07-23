const { trimStr } = require("./utils");
const TotalRespect = require('./models/TotalRespect');
const User = require('./models/User');

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
      status: '0',
      level: 1,
      rank: 'Салага'
    };
    console.log("Creating user with values:", userData);
    dbUser = await User.create(userData);
    console.log(`User created in database: ${dbUser.name} ${dbUser.respectCount} ${dbUser.status} ${dbUser.level} ${dbUser.rank}`);
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
    const respectPoints = user.respectCount;
    const newLevel = Math.floor(respectPoints / 150) + 1;  // каждые 150 уважений +1 уровень

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

module.exports = { addUser, getUsers, removeUser, incrementRespect, getTotalRespect, setStatus, updateUserLevel };
