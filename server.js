const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const app = express();

const { addUser, getUsers, removeUser, 
incrementRespect, incrementExperience , doubleRespect,
 getTotalRespect, setStatus, buyItem,
setLastSkin, getLastSkin } = require("./users");

const TotalRespect = require('./models/TotalRespect');
const User = require('./models/User');

// Раздача статических файлов из каталога 'public'
app.use(express.static('public'));

app.use(cors({ origin: "*" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});


//// RESPECT COUNTER / DATABASE UPDATING
let totalRespect = 0;
let lastKnownTotalRespect = 0;
let updateInterval;

async function initializeTotalRespect() {
  totalRespect = await getTotalRespect();
  lastKnownTotalRespect = totalRespect;
}

initializeTotalRespect();

function startUpdateInterval() {
  updateInterval = setInterval(async () => {
    const connectedClients = io.sockets.sockets.size;
    if (connectedClients > 0) {
      try {
        const dbTotalRespect = await TotalRespect.findOne();
        if (!dbTotalRespect) {
          await TotalRespect.create({ total: totalRespect });
        } else {
          await dbTotalRespect.update({ total: totalRespect });
        }
       // console.log(`Updated totalRespect in database: ${totalRespect}`);
        lastKnownTotalRespect = totalRespect;
      } catch (error) {
        console.error('SERV :: Error updating totalRespect in database:', error);
      }
    } else {
      console.log('SERV :: No connected clients, skipping database update.');
    }
  }, 300);
}

function stopUpdateInterval() {
  clearInterval(updateInterval);
}

//// SERVER GLOBAL CONNECTION
io.on('connection', (socket) => {
  console.log(`Connected :: ${socket.id}`);

  // client direct
  socket.emit('server-status', 'online');

  // when loggened
  socket.on("join", async ({ name }) => {
    const { user } = await addUser({ name });
    console.log(`Joined :: ${user.name}`);

    socket.username = user.name;

    const users = await getUsers();
    io.emit('updateUsers', { users, totalRespect });

    // Start update interval if it's not already running
    if (!updateInterval) {
      startUpdateInterval();
    }
  });

  // respect counter
  socket.on("respect", async () => {
    // Получаем данные пользователя
    const user = await User.findOne({ where: { name: socket.username } });

    if (user) {
      // Проверяем наличие предмета 'doublerespect'
      const userItems = JSON.parse(user.items);
      console.log(userItems);
      const hasDoubleRespect = userItems.includes('DoubleRespect');

      let updatedUser;
      if (hasDoubleRespect) {
        // Используем doubleRespect, если предмет найден
        updatedUser = await doubleRespect(socket.username);
        updatedUser = await incrementExperience(socket.username);
        totalRespect += 2;
      } else {
        // Используем incrementRespect в противном случае
        updatedUser = await incrementRespect(socket.username);
        updatedUser = await incrementExperience(socket.username);
        totalRespect += 1;
      }

      if (updatedUser) {
        console.log("User found for adding respect count");
        io.emit('animateRespect');

        const users = await getUsers();
        io.emit('updateUsers', { users, totalRespect });

        const colors = [1, 2, 3];
        const randomColorId = colors[Math.floor(Math.random() * colors.length)];
        io.emit('changeTextColor', { colorId: randomColorId });
      }
    }
  });
  

  // set status
  socket.on("setStatus", async (status) => {
    console.log("CLI :: setStatus received", status);
    const result = await setStatus(socket.username, status);
  
    if (result.success) {
      console.log(`${socket.username} :: status updated to :: ${status}`);
      const users = await getUsers();
      const totalRespect = await getTotalRespect();
      io.emit('updateUsers', { users, totalRespect });
    } else {
      socket.emit('statusUpdateError', result.message);
      console.log(result.message);
    }
  });

// buy item
socket.on('buyItem', async ({ itemName }) => {
  try {
    const result = await buyItem(socket.username, itemName);
    if (result.success) {
      console.log(`${socket.username} purchased ${itemName}`);
    } else {
      console.log(`${socket.username} failed to purchase ${itemName}: ${result.message}`);
    }

    // Отправить ответ клиенту
    socket.emit('buyItemResponse', result);

    // Обновить пользователей
    const users = await getUsers();
    io.emit('updateUsers', { users, totalRespect });
  } catch (error) {
    console.error('Error handling buyItem:', error);
    socket.emit('buyItemResponse', { success: false, message: 'Internal server error' });
  }
});

  // Установка последнего скина
  socket.on('setLastSkin', async ({ skin }) => {
    const result = await setLastSkin(socket.username, skin);
    if (result.success) {
      console.log(`${socket.username} set last skin to ${skin}`);
      io.emit('updateUsers', { users: await getUsers(), totalRespect });
    } else {
      console.log(result.message);
    }
  });

  // Получение последнего скина
  socket.on('getLastSkin', async () => {
    const lastSkin = await getLastSkin(socket.username);
    socket.emit('lastSkin', { lastSkin });
  });
  
//// IF CLIENT NOT RESPONDING
  socket.on('checkStatus', async () => {
    socket.emit('server-status', 'online');
    console.log(`${socket.id} :: trying to attempt server status`);
  })

  socket.on('disconnect', async () => {
    const user = await removeUser(socket.username);
    if (user) {
      console.log(`Disconnected :: ${user.name}`);
      const users = await getUsers();
      io.emit('updateUsers', { users, totalRespect });

      // Stop update interval if no more connected clients (respect count in db)
      const connectedClients = io.sockets.sockets.size;
      if (connectedClients === 0) {
        stopUpdateInterval();
      }
    }
  });
});


//// SERVER SETTINGS 
const PORT = 3009;
server.listen(PORT, () => {
  console.log(`SERV :: Running on ${PORT}`);
});
