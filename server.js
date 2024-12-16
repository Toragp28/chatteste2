const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];
let messages = []; // Tableau pour stocker les messages

app.use(express.static('public'));

io.on('connection', (socket) => {
  let currentUser = '';

  // Lorsqu'un utilisateur se connecte
  socket.on('new user', (username) => {
    currentUser = username;
    users.push(username);
    io.emit('user list', users); // Met à jour la liste des utilisateurs
    socket.emit('chat message', 'Bienvenue dans le chat!', 'Serveur'); // Envoie un message de bienvenue

    // Envoie tous les messages existants à l'utilisateur qui se connecte
    messages.forEach((msg) => {
      socket.emit('chat message', msg.content, msg.sender);
    });
  });

  // Lorsqu'un utilisateur envoie un message
  socket.on('chat message', (msg) => {
    const message = { content: msg, sender: currentUser };
    messages.push(message); // Stocke le message
    io.emit('chat message', msg, currentUser); // Diffuse le message à tous les utilisateurs
  });

  // Lorsqu'un utilisateur se déconnecte
  socket.on('disconnect', () => {
    users = users.filter(user => user !== currentUser);
    io.emit('user list', users); // Met à jour la liste des utilisateurs
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
