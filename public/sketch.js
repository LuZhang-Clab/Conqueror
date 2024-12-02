function setup() {
  let canvas = createCanvas(750, 750);
  noLoop(); // No looping for animation
  canvas.style('position', 'absolute'); // 让 canvas 不影响其他元素的布局
  canvas.style('top', '0'); // 固定在页面顶部
  canvas.style('left', '0'); // 固定在页面左侧
  canvas.style('z-index', '-1'); // 将 canvas 放到背景层
  let gridSize = 125; // Size of each grid
  let rows = 6; // Number of rows
  let cols = 6; // Number of columns

  // Draw the grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Skip the middle 4x4 grid (exclude these from being drawn)
      if (i >= 1 && i <= 4 && j >= 1 && j <= 4) {
        continue;
      }

      let x = j * gridSize; // Calculate x position of the grid
      let y = i * gridSize; // Calculate y position of the grid

      fill(0, 163, 108); // Set the grid color (greenish)
      stroke(0); // Set the stroke color to black
      rect(x, y, gridSize, gridSize); // Draw the rectangle (grid cell)     

      // Draw "start" in the top-left corner grid
      if (i === 0 && j === 0) {
        fill(0); // Set text color to black
        noStroke(); // No stroke for text
        textSize(50); // Set text size to 50
        textAlign(CENTER, CENTER); // Center the text horizontally and vertically
        text("start", x + gridSize / 2, y + gridSize / 2); // Draw the text "start" in the center of the grid
      }

      if (i === 0 && j === 5) {
        fill(0); // Set text color to black
        noStroke(); // No stroke for text
        textSize(50); // Set text size to 50
        textAlign(CENTER, CENTER); // Center the text horizontally and vertically
        text("6", x + gridSize / 2, y + gridSize / 2); // Draw the text "6" in the top-right corner
      }

      if (i === 5 && j === 5) {
        fill(0); // Set text color to black
        noStroke(); // No stroke for text
        textSize(50); // Set text size to 50
        textAlign(CENTER, CENTER); // Center the text horizontally and vertically
        text("11", x + gridSize / 2, y + gridSize / 2); // Draw the text "11" in the bottom-right corner
      }

      if (i === 5 && j === 0) {
        fill(0); // Set text color to black
        noStroke(); // No stroke for text
        textSize(50); // Set text size to 50
        textAlign(CENTER, CENTER); // Center the text horizontally and vertically
        text("16", x + gridSize / 2, y + gridSize / 2); // Draw the text "16" in the bottom-left corner
      }
    }
  }
}


function draw() {
  // No drawing logic is needed here, since everything is done in the setup function
}


// Initialize button event after the page loads
window.addEventListener("load", () => {
  //initializeButton(); // 初始化按钮事件
  //initializeCards(); // 初始化卡片布局
});

window.addEventListener("load", () => {
  // Function to handle the top-right-button and control the sliding panel
  const topRightButton = document.getElementById("top-right-button");
  const slideOutPanel = document.getElementById("slide-out-panel");

  // Trigger panel to slide out when mouse hovers over the button
  topRightButton.addEventListener("mouseover", () => {
    console.log("Mouse hovered on the button!");
    slideOutPanel.style.right = "0"; // 滑出页面
  });

  // Hide the panel when the mouse leaves the slide-out panel
  slideOutPanel.addEventListener("mouseleave", () => {
    console.log("Mouse left the panel!");
    slideOutPanel.style.right = "-600px"; // 恢复隐藏
  });
})


//Open and connect socket
let socket = io();

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('img.poker-card');
  //console.log(Found ${cards.length} cards.);

  if (cards.length === 0) {
    //console.error('No cards found!');
  } else {
    cards.forEach(card => {
      addDragFunctionality(card);
      //initializeCardPosition(card);
    });
  }
});


function addDragFunctionality(card) {
  let isDragging = false; // To track if the card is currently being dragged
  let offsetX = 0;
  let offsetY = 0; // To store the offset of the mouse position relative to the card


  // Mouse down event: Start dragging
  card.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Prevent default behavior
    isDragging = true;

    // 计算鼠标点击点相对于卡片左上角的偏移
    offsetX = e.clientX - card.offsetLeft;
    offsetY = e.clientY - card.offsetTop;


    // Set cursor to indicate dragging
    card.style.cursor = 'grabbing';

    // Bring the card to the front
    card.style.zIndex = 1000;

    // Add a mousemove event listener to the document
    document.addEventListener("mousemove", moveCard);
  });

  // Move the card function
  const moveCard = (e) => {
    if (isDragging) {
      // Calculate the new position of the card
      const newLeft = e.clientX - offsetX;
      const newTop = e.clientY - offsetY;


      card.style.left = `${newLeft}px`;
      card.style.top = `${newTop}px`;

      socket.emit("move-card", { id: card.id, x: newLeft, y: newTop });

    }
  };

  // Mouse up event: Stop dragging
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;

      // Reset the cursor
      card.style.cursor = 'grab';

      // Remove the mousemove event listener to stop dragging
      document.removeEventListener("mousemove", moveCard);
    }
  });
};

const positions = [];
document.querySelectorAll('.poker-card').forEach(card => {
  const randomX = Math.random() * window.innerWidth; // Example: random X position
  const randomY = Math.random() * window.innerHeight; // Example: random Y position

  positions.push({ id: card.id, x: randomX, y: randomY });

  // Optionally update the card's position visually
  card.style.position = "absolute";
  card.style.left = `${randomX}px`;
  card.style.top = `${randomY}px`;
});

socket.emit('initialize-s', positions); // 如果需要同步到后端
//console.log('Sent initial positions to server:', positions); // 打印初始化的位置信息


// Socket events for synchronization
socket.on('initialize-cards', (positions) => {
  //console.log('Received initial card positions from server:', positions); // 打印从服务器接收到的位置信息
  positions.forEach(position => {
    const card = document.getElementById(position.id);
    if (card) {
      card.style.position = "absolute";
      card.style.left = `${position.x}px`;
      card.style.top = ` ${position.y}px`;
    }
  });
});

socket.on("move-card", (data) => {
  //console.log(`Card ${data.id} moved on server to (${data.x}, ${data.y})`); // 打印服务器广播的卡片位置
  const card = document.getElementById(data.id);
  if (card) {
    card.style.position = "absolute";
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
  }
});

//Listen for confirmation of connection
socket.on('connect', function () {
  //console.log("Connected to server"); // 打印连接到服务器的消息
});

//Listen for an event named 'message-share' from the server
socket.on('message-share', (data) => {
  console.log('Message received from server:', data); // 打印从服务器接收到的消息
  addDragFunctionality(document.getElementById(data.id));

});

// 监听服务器的广播消息
socket.on('rollDice', (data) => {
  console.log('Roll dice broadcast received:', data);
  const dice = document.querySelector('#dice');
  if (dice) {
    // 调用 rollDice 函数同步动画和最终结果
    syncRollDice(dice, data.rotation, data.face);
  }
});

function rollDice(dice) {
  // 随机生成一个旋转角度
  const randomRotationX = Math.random() * 2160 - 1080;
  const randomRotationY = Math.random() * 2160 - 1080;
  const randomRotationZ = Math.random() * 2160 - 1080;

  // 计算随机选中的面
  const randomFace = Math.floor(Math.random() * 6) + 1;

  // 广播摇动事件
  const rotationData = { x: randomRotationX, y: randomRotationY, z: randomRotationZ };
  socket.emit('rollDice', { rotation: rotationData, face: randomFace });


  // 本地播放动画
  animateDice(dice, rotationData, randomFace);
}

// 同步摇骰子动画
function syncRollDice(dice, rotation, faceNumber) {
  animateDice(dice, rotation, faceNumber);
}

// 动画逻辑封装
function animateDice(dice, rotation, faceNumber) {
  const { x, y, z } = rotation;

  // 摇动动画
  dice.setAttribute('animation__rotation', {
    property: 'rotation',
    to: `${x} ${y} ${z}`,
    dur: 1000,
    loop: false // 不循环
  });

  // 在动画结束后设置随机面在最显眼的位置
  dice.addEventListener('animationcomplete', () => {

    updateDiceRotation(faceNumber, dice);
  }, { once: true }); // 确保事件处理程序只执行一次
}


function updateDiceRotation(faceNumber, dice) {
  // 每个面的旋转角度设置（使随机选中的面在用户视角最明显）
  const rotationAngles = {
    1: { x: 90, y: 0, z: 0 },  // 面 1
    2: { x: -90, y: 0, z: 0 }, // 面 2
    3: { x: 0, y: 90, z: 0 },  // 面 3
    4: { x: 0, y: -90, z: 0 }, // 面 4
    5: { x: 0, y: 0, z: 0 },   // 面 5
    6: { x: 180, y: 0, z: 0 }  // 面 6
  };

  // 获取随机面的旋转角度
  const angle = rotationAngles[faceNumber];

  // 设置色子的旋转角度
  dice.setAttribute('rotation', `${angle.x} ${angle.y} ${angle.z}`);

}
// 注意：关闭嵌套回调函数
document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  if (sceneEl) {
    sceneEl.addEventListener('loaded', () => {
      console.log('Scene loaded!');
      const dice = document.querySelector('#dice');
      if (dice) {
        console.log('Dice element found!');
        dice.addEventListener('mousedown', () => {
          console.log('Dice mousedown event triggered!');
          rollDice(dice); // 调用 rollDice 函数
        });
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const resetButton = document.getElementById('my-button'); // 获取按钮
  const dice = document.querySelector('#dice'); // 获取色子对象

  if (sceneEl) {
    sceneEl.addEventListener('loaded', () => {
      console.log('Scene loaded!');
      if (dice) {
        console.log('Dice element found!');

        // 添加按钮的点击事件
        resetButton.addEventListener('click', () => {
          console.log('Reset button clicked!');

        // 重置色子的旋转状态
        dice.setAttribute('rotation', '0 45 45');
      });

    // 色子拖动功能
    dice.addEventListener('mousedown', () => {
      console.log('Dice mousedown event triggered!');
      rollDice(dice); // 调用 rollDice 函数
    });

  }
});
  }
})
