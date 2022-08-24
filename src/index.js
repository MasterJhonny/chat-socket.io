const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 3000;
const listUsers = []

app.use(express.static(path.join(__dirname, 'views')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views'));
})


io.on("connect", socket => {

    const userId = socket.id; 
    const username = "User-" + userId.substring(0, 3);
    
    // -------eventos de connection--------------//
    io.to(userId).emit("username", username);
    listUsers.push({
        id: userId,
        username
    })

    // ----list users---//
    socket.on("disconnect", () => {
        listUsers.pop();
        console.log("Disconnect:client", userId);
        io.emit("welcome", {
            listUsers: listUsers,
            count: io.engine.clientsCount
        });
    })

    // --------------eventos de emicion -------------//
    // emit count
    io.emit("welcome", {
        listUsers: listUsers,
        count: io.engine.clientsCount
    });

    socket.on("message:send", (data) => {
        socket.broadcast.emit("message:received", {
            message: data,
            users: listUsers
        })
    })

    socket.on("typing:send", (data) => {
        socket.broadcast.emit("typing:received", data)
    })

    // // emit one
    // socket.on("last", (message) => {
    //     const id = listSocket[listSocket.length - 1];

    //     io.to(id).emit("saludo", message);

    // }) 

})

httpServer.listen(port, () => {
    console.log(`http://localhost:${port}`)
})

