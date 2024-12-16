const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Change "*" pour limiter l'accès à des domaines spécifiques en production
    methods: ['GET', 'POST']
  }
});

// Variables globales
let users = [];
let messages = []; // Tableau pour stocker les messages
const MAX_MESSAGES = 100; // Limite d'historique des messages

// Middleware de sécurité
app.use(helmet());

// Middleware pour les fichiers statiques
app.use(express.static('public'));

// WebSocket
io.on('connection', (socket) => {
  let currentUser = '';

  // Lorsqu'un utilisateur se connecte
  socket.on('new user', (username) => {
    if (!username || users.includes(username)) {
      socket.emit('error', 'Nom d’utilisateur invalide ou déjà utilisé.');
      return;
    }
    currentUser = username;
    users.push(username);
    io.emit('user list', users); // Met à jour la liste des utilisateurs

    // Message de bienvenue
    socket.emit('chat message', 'Bienvenue dans le chat!', 'Serveur');

    // Envoie tous les messages existants
    messages.forEach((msg) => {
      socket.emit('chat message', msg.content, msg.sender);
    });
  });

  // Lorsqu'un utilisateur envoie un message
  socket.on('chat message', (msg) => {
    if (!currentUser) {
      socket.emit('error', 'Vous devez être connecté pour envoyer un message.');
      return;
    }
    const message = { content: msg, sender: currentUser };

    // Limite l’historique des messages
    if (messages.length >= MAX_MESSAGES) {
      messages.shift(); // Supprime le plus ancien message
    }
    messages.push(message); // Stocke le message
    io.emit('chat message', msg, currentUser); // Diffuse le message à tous les utilisateurs
  });

  // Lorsqu'un utilisateur se déconnecte
  socket.on('disconnect', () => {
    if (currentUser) {
      users = users.filter((user) => user !== currentUser);
      io.emit('user list', users); // Met à jour la liste des utilisateurs
    }
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
