const { trimStr } = require("./utils");

let users = [];

const addUser = (user) => {
  const userName = trimStr(user.name);

  const isExist = users.find((u) => trimStr(u.name) === userName);

  if (!isExist) {
    user.respectCount = 0;
    users.push(user);
  }

  const currentUser = isExist || user;

  return { isExist: !!isExist, user: currentUser };
};

const getUsers = () => users;

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const incrementRespect = (id) => {
  const user = users.find((user) => user.id === id);
  if (user) {
    user.respectCount += 1;
  }
  return user;
};

const getTotalRespect = () => {
  return users.reduce((total, user) => total + user.respectCount, 0);
};

module.exports = { addUser, getUsers, removeUser, incrementRespect, getTotalRespect };
