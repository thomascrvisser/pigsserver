const app = require('express')();

const server = require('http').createServer(app);

const io = require('socket.io')(server);

io.on("connection", (socket) => {
    console.log("Socket: ", socket);
    console.log("Socket is active to be connected");

    socket.on("customevent", (payload) => {
        console.log("Payload: ", payload);
        io.emit("customevent", payload);
    });
});

server.listen(4000, () => {
    console.log('Server is listening at port 4000...');
})