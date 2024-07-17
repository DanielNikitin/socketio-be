const { trimStr } = require("./utils");
const TotalRespect = require('./models/TotalRespect');
const User = require('./models/User');

let users = [];

const addUser = async (user) => {
  const userName = trimStr(user.name);

  let dbUser = await User.findOne({ where: { name: userName } });
  if (!dbUser) {
    const userData = {
      name: userName,
      respectCount: 0
    };
    console.log("Creating user with values:", userData);
    dbUser = await User.create(userData);
    console.log(`User created in database: ${dbUser.name}`);
  }

  const currentUser = dbUser.dataValues;

  if (!users.find(u => u.name === currentUser.name)) {
    users.push(currentUser);
  }

  return { isExist: !!dbUser, user: currentUser };
};

const getUsers = async () => {
  return users;
};

const removeUser = (name) => {
  const index = users.findIndex((user) => user.name === name);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const incrementRespect = async (name) => {
  const user = users.find((user) => user.name === name);
  if (user) {
    user.respectCount += 1;
    await User.update({ respectCount: user.respectCount }, { where: { name: user.name } });

    // Обновление пользователя в массиве users
    const updatedUser = await User.findOne({ where: { name: user.name } });
    if (updatedUser) {
      const index = users.findIndex(u => u.name === user.name);
      users[index] = updatedUser.dataValues;
    }

    return updatedUser.dataValues;
  }
};

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

module.exports = { addUser, getUsers, removeUser, incrementRespect, getTotalRespect };
