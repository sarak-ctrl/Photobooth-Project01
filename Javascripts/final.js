// final.js (editor page)
const WIDTH = 1176, HEIGHT = 1470;

// DOM elements
const canvas = document.getElementById('finalCanvas'),
      ctx = canvas.getContext('2d'),
      addSticker1Btn = document.getElementById('sticker1Button'),
      addSticker2Btn = document.getElementById('sticker2Button'),
      resetBtn = document.getElementById('resetButton'),
      downloadBtn = document.getElementById('downloadBtn'),
      homeBtn = document.getElementById('homeBtn'),
      filterSelect = document.getElementById('editorFilterSelect');

// Sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;

// Load photo from localStorage
const finalImage = new Image();
const dataURL = localStorage.getItem('photoStrip');
if (!dataURL) {
    alert("No photo found!");
} else {
    finalImage.src = dataURL;
    finalImage.onload = drawCanvas;
}

// Draw canvas with optional filter
function drawCanvas() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Apply filter only to background photo
    ctx.filter = filterSelect?.value || 'none';
    ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);

    // Draw stickers on top (no filter)
    ctx.filter = 'none';
    stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// Add sticker
function addSticker(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        stickers.push({
            img,
            x: WIDTH / 2 - img.width / 6,
            y: HEIGHT / 2 - img.height / 6,
            width: img.width / 2.5,
            height: img.height / 2.5,
            dragging: false
        });
        drawCanvas();
    };
}

// Drag-and-drop
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect(),
          scaleX = canvas.width / rect.width,
          scaleY = canvas.height / rect.height,
          clientX = e.touches?.[0]?.clientX ?? e.clientX,
          clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function pointerDown(e) {
    const { x, y } = getPointerPos(e);
    for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i];
        if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
            selectedSticker = s;
            s.dragging = true;
            dragOffset.x = x - s.x;
            dragOffset.y = y - s.y;
            // Bring to front
            stickers.splice(i, 1);
            stickers.push(s);
            drawCanvas();
            e.preventDefault();
            break;
        }
    }
}
function pointerMove(e) {
    if (!selectedSticker?.dragging) return;
    const { x, y } = getPointerPos(e);
    selectedSticker.x = x - dragOffset.x;
    selectedSticker.y = y - dragOffset.y;
    drawCanvas();
    e.preventDefault();
}
function pointerUp() {
    if (selectedSticker) selectedSticker.dragging = false;
    selectedSticker = null;
}

// Mouse & touch events
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// Sticker buttons with fixed paths
addSticker1Btn.addEventListener('click', () => addSticker('assets/photobooth/camerapage/stickers/sticker1.png'));
addSticker2Btn.addEventListener('click', () => addSticker('assets/photobooth/camerapage/stickers/sticker2.png'));

// Reset button
resetBtn.addEventListener('click', () => {
    stickers = [];
    drawCanvas();
});

// Download button
downloadBtn.addEventListener('click', () => {
    canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'photo-final.png';
        a.click();
    }, 'image/png');
});

// Home button
homeBtn.addEventListener('click', () => window.location.href = 'camerapage.html');

// Redraw on filter change
if (filterSelect) filterSelect.addEventListener('change', drawCanvas);

// Optional logo redirect
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    if (logo) logo.addEventListener('click', () => window.location.href = 'camerapage.html');
});
