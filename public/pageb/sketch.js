


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

  const cityNames = [
    "Minas Tirith", "Barad-dûr", "Hobbiton", "Isengard", "Lothlórien",
    "Annúminas", "Rivendell", "Dol Guldur", "Isildur", "Osgiliath",
    "Gondolin", "Cair Andros", "Anglond", "Minas Morgul", "Dol Amroth",
    "Bree", "Weathertop", "Amon Rûdh", "Lond Daer", "Harad"
  ];

  let cityIndex = 0; // 用于遍历城市名称数组

  // Define the order of numbers 
  let gridOrder = [
    [1, 2, 3, 4, 5, 6],           // 最上面一行
    [20, null, null, null, null, 7], // 左侧第一个和右侧第一个（跳过中间）
    [19, null, null, null, null, 8],
    [18, null, null, null, null, 9],
    [17, null, null, null, null, 10],
    [16, 15, 14, 13, 12, 11],    // 最下面一行
  ];

  // Draw the grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = j * gridSize; // Calculate x position of the grid
      let y = i * gridSize; // Calculate y position of the grid

  
      fill(0, 163, 108); 
      stroke(0); 
      rect(x, y, gridSize, gridSize); 

      // 获取当前格子的数字
      let number = gridOrder[i][j];

      // 如果是有效格子，则绘制数字和城市名称
      if (number !== null) {
        let circleX = x + gridSize / 2; // 圆心的 x 坐标
        let circleY = y + gridSize * 0.8; // 圆心的 y 坐标（靠近底部）
        let circleDiameter = gridSize * 0.25; // 圆的直径

        fill(255, 195, 0); 
        noStroke(); 
        ellipse(circleX, circleY, circleDiameter); 

        fill(0); 
        textSize(16); 
        textAlign(CENTER, CENTER); 
        text(number, circleX, circleY); 

        if (cityIndex < cityNames.length) {
          fill(0); 
          textSize(18); 
          textStyle(BOLD); 
          textAlign(CENTER, CENTER); 
          text(cityNames[cityIndex], x + gridSize / 2, y + gridSize / 4); 
          cityIndex++; 
        }
      }
    }
  }
}

function draw() {
  // No drawing logic is needed here, since everything is done in the setup function
}


window.addEventListener("load", () => {
 
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

  const positions = []; // 用于存储初始化位置

  if (cards.length === 0) {
    //console.error('No cards found!');
  } else {
    cards.forEach(card => {
      addDragFunctionality(card);

      // 获取卡片在页面上的初始位置
      const initialX = card.offsetLeft;
      const initialY = card.offsetTop;

      // 设置卡片位置为 absolute 并保持当前位置
      card.style.position = 'absolute';
      card.style.left = `${initialX}px`;
      card.style.top = `${initialY}px`;

      // 保存位置到 positions 数组
      positions.push({ id: card.id, x: initialX, y: initialY });

    });


    // 将初始位置发送到服务器
    socket.emit('initialize-cards', positions);
    console.log('Sent initial positions to server:', positions);

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


socket.on("move-card", (data) => {
  const card = document.getElementById(data.id);
  if (card) {
    card.style.position = "absolute";
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
  }
});

//Listen for confirmation of connection
socket.on('connect', function () {
  //console.log("Connected to server"); 
});

//Listen for an event named 'message-share' from the server
socket.on('message-share', (data) => {
  console.log('Message received from server:', data); 
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
    loop: false 
  });


  dice.addEventListener('animationcomplete', () => {

    updateDiceRotation(faceNumber, dice);
  }, { once: true }); 
}


function updateDiceRotation(faceNumber, dice) {
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
          rollDice(dice); 
        });
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const resetButton = document.getElementById('my-button'); 
  const dice = document.querySelector('#dice'); 

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
          rollDice(dice); 
        });

      }
    });
  }
})

document.addEventListener('DOMContentLoaded', function () {
  // 在DOM加载完成后绑定事件
  const startButton = document.getElementById('backtomain');
  if (startButton) {
    startButton.addEventListener('click', function () {
      // 使用相对路径跳转到 pagea 文件夹中的 index.html
      window.location.href = '../pagea/index.html';
    });
  }
});


