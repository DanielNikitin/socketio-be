const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const app = express();

const { addUser, getUsers, removeUser, 
incrementRespect, getTotalRespect, setStatus } = require("./users");

const TotalRespect = require('./models/TotalRespect');

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
 // console.log(`Initial totalRespect from database: ${totalRespect}`);
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
        console.error('Error updating totalRespect in database:', error);
      }
    } else {
      console.log('No connected clients, skipping database update.');
    }
  }, 5000);
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
    console.log(`Connected ${user.name}`);

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
    const user = await incrementRespect(socket.username);

    if (user) {
      console.log("User found for adding respect count");
      totalRespect += 1;
      io.emit('animateRespect');

      const users = await getUsers();
      io.emit('updateUsers', { users, totalRespect });

      const colors = [1, 2, 3];
      const randomColorId = colors[Math.floor(Math.random() * colors.length)];
      io.emit('changeTextColor', { colorId: randomColorId });
    }
  });

  // set status
  socket.on("setStatus", async (status) => {
    console.log("CLI :: setStatus received", status);
    const result = await setStatus(socket.username, status);
  
    if (result.success) {
      console.log(`Status updated to: ${status}`);
      const users = await getUsers();
      const totalRespect = await getTotalRespect();
      io.emit('updateUsers', { users, totalRespect });
    } else {
      socket.emit('statusUpdateError', result.message);
      console.log(result.message);
    }
  });
  
//// IF CLIENT NOT RESPONDING
  socket.on('checkStatus', async () => {
    socket.emit('server-status', 'online');
    console.log(`${socket.id} trying to attempt server status`);
  })

  socket.on('disconnect', async () => {
    const user = await removeUser(socket.username);
    if (user) {
      console.log(`Disconnected ${user.name}`);
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
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`SERV :: Running on ${PORT}`);
});
