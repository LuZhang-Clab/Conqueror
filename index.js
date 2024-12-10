const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files for pagea and pageb
app.use('/pagea', express.static(path.join(__dirname, 'public/pagea')));
app.use('/pageb', express.static(path.join(__dirname, 'public/pageb')));
app.use('/pagec', express.static(path.join(__dirname, 'public/pagec')));

// 默认路由，重定向到 /pagea
app.get('/', (req, res) => {
    res.redirect('/pagea');
  });
  

// Initialize card positions for pageb
let cardPositions = {};

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Get the client's referring page
    const referer = socket.handshake.headers.referer;
    console.log('Client connected from:', referer);

    if (referer && referer.includes('/pagea')) {
        console.log('Client is from /pagea');


// Broadcast random card images when a new client connects
socket.on('randomizeCards', (shuffledImages) => {
    // Emit the shuffled image order to all clients
    io.emit('randomizeCards', shuffledImages);
});

        // Listen for flipCard events (specific to /pagea)
        socket.on('flipCard', (cardIndex) => {
            console.log(`FlipCard event received for /pagea, cardIndex: ${cardIndex}`);
            socket.broadcast.emit('flipCard', cardIndex);
        });



    } else if (referer && referer.includes('/pageb')) {
        console.log('Client is from /pageb');


        // Send the initial card positions to the new user
        socket.emit('initialize-cards', Object.values(cardPositions));

        // Handle move-card event
        socket.on('move-card', (data) => {
            // Update the card position in the server
            cardPositions[data.id] = { id: data.id, x: data.x, y: data.y };

            // Broadcast the updated card position to all other clients
            io.emit('move-card', cardPositions[data.id]);
        });

        // Handle initialize-s event (sync initial card positions)
        socket.on('initialize-s', (positions) => {
            positions.forEach((pos) => {
                cardPositions[pos.id] = { id: pos.id, x: pos.x, y: pos.y };
            });

            // Broadcast all card initial positions to the clients
            io.emit('initialize-cards', Object.values(cardPositions));
        });

        // Handle rollDice event
        socket.on('rollDice', (data) => {
            console.log('Roll dice event received:', data);

            // Broadcast the dice roll to other users
            socket.broadcast.emit('rollDice', data);
        });
    } else {
        console.log('Client is from an unknown page, no specific events bound.');
    }

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
    });
});

let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

