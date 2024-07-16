const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const app = express();

const { addUser, getUsers, removeUser, incrementRespect, getTotalRespect } = require("./users");

app.use(cors({ origin: "*" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

let totalRespect = 0;  // Глобальная переменная для хранения общего количества респектов

io.on('connection', (socket) => {
  socket.on("join", ({ name }) => {
    const { user } = addUser({ id: socket.id, name });
    console.log(`Connected ${user.name}`);
    console.log(user);

    socket.emit('message', {
      data: { user: { name: "Admin", message: `Hello ${user.name}` } }
    });

    // Отправка обновленного списка пользователей и общего счета респектов всем клиентам
    const users = getUsers();
    io.emit('updateUsers', { users, totalRespect });
  });

  socket.on("respect", () => {
    const user = incrementRespect(socket.id);
    if (user) {
      totalRespect += 1;  // Увеличиваем общий счетчик респектов
      io.emit('animateRespect');

      const users = getUsers();
      io.emit('updateUsers', { users, totalRespect });

      // Отправка события для изменения цвета кнопки
      const colors = [1, 2, 3]; // ID цветов
      const randomColorId = colors[Math.floor(Math.random() * colors.length)];
      io.emit('changeTextColor', { colorId: randomColorId });
      console.log(randomColorId);
    }
  });

  socket.on("status", () => {
    socket.emit("status", "online");
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(`Disconnected ${user.name}`);
      const users = getUsers();
      io.emit('updateUsers', { users, totalRespect });
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});