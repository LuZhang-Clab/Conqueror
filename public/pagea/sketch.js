// 连接到 Socket.io 服务器
const socket = io();

// 定义四张卡片的正面图片列表
const images = [
    'kingA/1.13.png', // kingD
    'kingA/2.13.png', // kingS
    'kingA/3.13.png', // kingH
    'kingA/4.13.png'  // kingC
];

// 随机打乱数组的函数
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交换元素
    }
}

// 打乱并更新每张卡片的正面图片
function randomizeCards() {
    shuffle(images); // 打乱图片顺序
    const cards = document.querySelectorAll('.kingCard');

    // 对每张卡片应用随机图片
    cards.forEach((card, index) => {
        const frontImage = card.querySelector('img:not(.kingB)');
        frontImage.src = images[index]; // 更新正面图片
    });
    // Emit the shuffled images to the server to synchronize with all clients
    socket.emit('randomizeCards', images);
}

// 页面加载时调用函数来随机化卡片
window.onload = function () {
    randomizeCards();
};

// 翻转卡片的函数
function flipImage(element) {
    var card = element.querySelector(".kingCard");

    var frontImage = card.querySelector("img:not(.kingB)"); // 选择正面图像
    var backImage = card.querySelector(".kingB"); // 选择背面图像


    // 获取卡片的索引
    const cards = document.querySelectorAll('.kingCard');
    const cardIndex = Array.from(cards).indexOf(card);


    // 切换翻转动画
    if (card.style.transform === "rotateY(180deg)") {
        // 如果卡片已经翻转，恢复正面
        card.style.transform = "rotateY(0deg)";
        frontImage.style.display = "none"; // 隐藏正面
        backImage.style.display = "block"; // 显示背面
    } else {
        // 如果卡片未翻转，翻转到背面
        card.style.transform = "rotateY(180deg)";
        backImage.style.display = "none"; // 隐藏背面
        frontImage.style.display = "block"; // 显示正面
    }
    
// 将翻转事件同步到服务器和其他客户端
socket.emit('flipCard', cardIndex);
}


// Listen for shuffled images from the server
socket.on('randomizeCards', (shuffledImages) => {
    // Update card images based on the shuffled images
    const cards = document.querySelectorAll('.kingCard');
    shuffledImages.forEach((image, index) => {
        const frontImage = cards[index].querySelector('img:not(.kingB)');
        frontImage.src = image; // Update front image
    });
});


// 监听服务器广播的卡片翻转事件
socket.on('flipCard', (cardIndex) => {
    const card = document.querySelectorAll('.kingCard')[cardIndex];

    const frontImage = card.querySelector('img:not(.kingB)');
    const backImage = card.querySelector('.kingB');

    if (card.style.transform === "rotateY(180deg)") {
        card.style.transform = "rotateY(0deg)";
        frontImage.style.display = "none";
        backImage.style.display = "block";
    } else {
        card.style.transform = "rotateY(180deg)";
        backImage.style.display = "none";
        frontImage.style.display = "block";
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // 在DOM加载完成后绑定事件
    const startButton = document.getElementById('StartGame');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // 使用相对路径跳转到 pageb 文件夹中的 index.html
            window.location.href = '../pageb/index.html';
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // 在DOM加载完成后绑定事件
    const startButton = document.getElementById('gotobackgroundknowledge');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // 使用相对路径跳转到 pagec 文件夹中的 index.html
            window.location.href = '../pagec/index.html';
        });
    }
});