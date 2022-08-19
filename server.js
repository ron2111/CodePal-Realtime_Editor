const express = require("express"); // imported express
const app = express(); // called express
const http = require("http"); // http module from node
const path = require("path");
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");

const server = http.createServer(app); // server created with express server object: app
const io = new Server(server);
// -----------------------------Server Creation Done----------------------------------

app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {}; // to store the mapping of socket id and username
function getAllConnectedClients(roomId) {
  // from is used to convert array fom map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    // will get the array with the respective roomId from the list of all the rooms, then we map it using socketId, and return the respective socketIds with username
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId], // to get specific msgs about joining/leaving clients
      };
    }
  );
}

io.on("connection", (socket) => {
  // gets triggered when a socket is connected to server
  console.log("socket connected", socket.id); // we get the current socket in callback

  // we need to listen the join event emited after joining th room:
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    // callback contains the parameters sent by the joining event

    // no we need to store the mapping of socket id and username
    userSocketMap[socket.id] = username;
    // currently stored in memory, but for prodction level prefer some file system or redis for the storage handling

    socket.join(roomId); // joining the socket with the room

    // after joining we need to notify all the other clients of the newly joined member
    const clients = getAllConnectedClients(roomId); // for that we need to get a list of clients
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        // emitting a msg to every client of joining of the new member

        // sending some other important data
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000; // takes default port, if not available then 5000
server.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // listening with callback
