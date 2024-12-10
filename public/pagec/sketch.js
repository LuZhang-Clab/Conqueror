document.addEventListener('DOMContentLoaded', function() {
    // 在DOM加载完成后绑定事件
    const startButton = document.getElementById('backtopagea');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // 使用相对路径跳转到 pagea 文件夹中的 index.html
            window.location.href = '../pagea/index.html';
        });
    }
  });