//------------Initialize the express 'app' object--------
let express = require("express"); 
let app = express(); 

//----------Initialize HTTP server------
let http = require("http");
let server = http.createServer(app);

//------------Initialize socket.io---------
let io = require("socket.io");
io = new io.Server(server);

// ------Set the server to listen on port 3000 -------
let port = process.env.PORT || 3000;  
server.listen(port, () => {  
    console.log(`Server is running on port ${port}`);  
});


let cardPositions = {};

app.use("/", express.static("public"));

// Handle a new connection event
io.on("connection", (socket) => {  // Listen for clients connecting to the Socket.IO server
    console.log("A user connected:" + socket.id);  // Log when a user successfully connects to the server
    

// 发送当前的卡片位置给新连接的用户
socket.emit("initialize-cards", Object.values(cardPositions));

// 监听卡片移动事件
socket.on("move-card", (data) => {
    // 更新卡片位置
    cardPositions[data.id] = { id: data.id, x: data.x, y: data.y };

    // 广播给所有客户端，更新卡片位置
    io.emit("move-card", cardPositions[data.id]);
  });

  // 监听卡片初始位置的同步事件
  socket.on("initialize-s", (positions) => {
    // 更新全局卡片位置
    positions.forEach((pos) => {
      cardPositions[pos.id] = { id: pos.id, x: pos.x, y: pos.y };
    });

    // 广播所有卡片的初始位置给客户端
    io.emit("initialize-cards", Object.values(cardPositions));
  });

   // 监听摇动色子事件
   socket.on('rollDice', (data) => {
    console.log('Roll dice event received:', data);

    // 广播给其他用户
    socket.broadcast.emit('rollDice', data);
  });


// Handle a disconnection event
    socket.on("disconnect", () => {  // Listen for the disconnection event when a user disconnects from the server
        console.log("A user disconnected"+ socket.id);  // Log when a user disconnects from the server
    });
});

