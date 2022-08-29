const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { User } = require('./user');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 3000;


let listUsers = []

app.use(express.static(path.join(__dirname, 'views')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views'));
})


io.on("connect", socket => {

    const newUser = new User(socket.id);
    console.log("id connect", newUser.getId());
    
    // -------eventos de connection--------------//
    io.to(newUser.getId()).emit("userdata", newUser);

    listUsers.push(newUser);

    console.log(listUsers)

    
    // --------------eventos de emicion -------------//
    // emit count
    io.emit("welcome", {
        listUsers: listUsers,
        count: io.engine.clientsCount
    });

    socket.on("message:send", (data) => {
        listUsers = listUsers.map(user => {
            if (user.id === data.id) {
                return {
                    ...user,
                    name: data.name
                };
            } else {
                return user;
            }
        })
        if (data.toMessage === "Todos") {
            socket.broadcast.emit("message:received", data);
        } else {
            io.to(data.toMessage).emit("message:received", data);
        }
    })

    socket.on("typing:send", (data) => {
        if(data.toMessage === "Todos") {
            socket.broadcast.emit("typing:received", data.toTyping)
        } else {
            io.to(data.toMessage).emit("typing:received", data.toTyping);
        }
    })

    // // emit one
    // socket.on("last", (message) => {
        //     const id = listSocket[listSocket.length - 1];
        
        //     io.to(id).emit("saludo", message);
        
        // }) 


        
        
    // ----list users---//
    socket.on("disconnect", () => {
        const connectUsers = listUsers.filter(user => user.id !== newUser.getId());

        listUsers = [...connectUsers];

        console.log("Disconnect:client", newUser.getId());
        io.emit("welcome", {
            listUsers: listUsers,
            count: io.engine.clientsCount
        });
    })
})

httpServer.listen(port, () => {
    console.log(`http://localhost:${port}`)
})

