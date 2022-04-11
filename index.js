const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { randomUUID } = require("crypto");
const { callbackify } = require("util");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", //which url is making calls to server
    methods: ["GET", "POST"],
  },
});

// Instance Variables
const rooms = {};

/**
 * Connect a socket to a specified room
 * @param socket A connected socket.io socket
 * @param room An object that represents a room from the 'rooms' instance variable object
 */
const joinRoom = (socket, room) => {
  if (room.sockets.length >= room.maxPlayers) {
    console.log("Room is full");
  } else {
    room.sockets.push(socket);
    socket.join(room.id, () => {
      // store the room id in the socket for future use
      socket.roomId = room.id;
      console.log(socket.id, "joined", room.id);
    });
  }
};

/**
 * Will make the socket leave any rooms that it is a part of
 * @param socket A connected socket.io socket
 */
const leaveRooms = (socket) => {
  const roomsToDelete = [];
  for (const id in rooms) {
    const room = rooms[id];
    // check to see if the socket is in the current room
    if (room.sockets.includes(socket)) {
      socket.leave(id);
      // remove the socket from the room object
      room.sockets = room.sockets.filter((item) => item !== socket);
    }
    // Prepare to delete any rooms that are now empty
    if (room.sockets.length == 0) {
      roomsToDelete.push(room);
    }
  }

  // Delete all the empty rooms that we found earlier
  for (const room of roomsToDelete) {
    delete rooms[room.id];
  }
};

// Starting point for connecting to server
io.on("connection", (socket) => {
  socket.id = randomUUID();
  console.log(`User connected with ID: ${socket.id}`);

  socket.on("ready", () => {
    console.log(socket.id, "is ready");
    const room = rooms[socket.roomId];

    // starting out with only 2 players but learn how to add custom amoutn
    if (room.sockets.length == 2) {
    }
  });

  socket.on("join_room", (data) => {
    console.log("join room data", data);
    joinRoom(socket, data);
  });

  socket.on("create_room", (data) => {
    const room = {
      id: randomUUID(),
      name: data.roomName,
      sockets: [],
      maxPlayers: data.maxPlayers,
    };
    rooms[room.id] = room;
    console.log(`Creating room: ${room.name} with ID: ${room.id}`);

    joinRoom(socket, room);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });

  socket.on("list_rooms", (callback) => {
    const allRooms = [];
    for (const id in rooms) {
      const { name, maxPlayers } = rooms[id];
      const players = rooms[id].sockets.length;
      const room = { name, id, players, maxPlayers };
      allRooms.push(room);
    }
    console.log(allRooms);
    callback(allRooms);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
