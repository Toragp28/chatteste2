const socket = io();
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const chatContainer = document.getElementById('chat-container');
const loginContainer = document.getElementById('login-container');
const userList = document.getElementById('users');
const messageInput = document.getElementById('input-message');
const sendButton = document.getElementById('send-message');
const messagesList = document.getElementById('messages');

// Gérer la soumission du formulaire de connexion
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    socket.emit('new user', username);
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
  }
});

// Gérer l'envoi de messages
sendButton.addEventListener('click', function () {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', message);
    messageInput.value = '';
  }
});

// Afficher les messages avec animation
socket.on('chat message', function (msg, sender) {
  const li = document.createElement('li');
  li.textContent = `${sender}: ${msg}`;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
});

// Afficher les utilisateurs connectés
socket.on('user list', function (users) {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    userList.appendChild(li);
  });
});
