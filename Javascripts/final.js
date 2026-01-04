// editor.js (or final.js)
const WIDTH = 1176, HEIGHT = 1470;

// DOM elements
const canvas = document.getElementById('finalCanvas'),
      ctx = canvas.getContext('2d'),
      addFishBtn = document.getElementById('addFish'),
      addOctopusBtn = document.getElementById('addOctopus'),
      addSeaweedBtn = document.getElementById('addSeaweed'),
      addAxBtn = document.getElementById('addAx'),
      addBubbleBtn = document.getElementById('addBubble'),
      downloadBtn = document.getElementById('downloadBtn'),
      homeBtn = document.getElementById('homeBtn'),
      resetBtn = document.getElementById('reset'),
      filterSelect = document.getElementById('editorFilterSelect');

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;

// disable sticker buttons until photo loads
[addFishBtn, addOctopusBtn, addSeaweedBtn, addAxBtn, addBubbleBtn].forEach(btn => btn.disabled = true);

// load photo
const finalImage = new Image();
const dataURL = localStorage.getItem('photoStrip');

if (!dataURL) {
    alert("No photo found!");
} else {
    finalImage.src = dataURL;
    finalImage.onload = () => {
        drawCanvas();
        // enable sticker buttons once photo is ready
        [addFishBtn, addOctopusBtn, addSeaweedBtn, addAxBtn, addBubbleBtn].forEach(btn => btn.disabled = false);
        localStorage.removeItem('photoStrip'); // clear saved photo
    };
}

// draw canvas with optional filter
function drawCanvas() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Apply filter to background only
    ctx.filter = filterSelect?.value || 'none';
    ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);

    // Draw stickers without filter
    ctx.filter = 'none';
    stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// add sticker
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

// get pointer position
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect(),
          scaleX = canvas.width / rect.width,
          scaleY = canvas.height / rect.height,
          clientX = e.touches?.[0]?.clientX ?? e.clientX,
          clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

// drag & drop
function pointerDown(e) {
    const { x: mouseX, y: mouseY } = getPointerPos(e);
    for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i];
        if (mouseX >= s.x && mouseX <= s.x + s.width && mouseY >= s.y && mouseY <= s.y + s.height) {
            selectedSticker = s;
            s.dragging = true;
            dragOffset.x = mouseX - s.x;
            dragOffset.y = mouseY - s.y;
            // bring to front
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
    const { x: mouseX, y: mouseY } = getPointerPos(e);
    selectedSticker.x = mouseX - dragOffset.x;
    selectedSticker.y = mouseY - dragOffset.y;
    drawCanvas();
    e.preventDefault();
}
function pointerUp() {
    if (selectedSticker) selectedSticker.dragging = false;
    selectedSticker = null;
}

// mouse & touch events
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// sticker buttons
addFishBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/fish.png'));
addOctopusBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/octopus.png'));
const seaweedImages = [
    'Assets/fish-photobooth/camerapage/stickers/seaweed1.png',
    'Assets/fish-photobooth/camerapage/stickers/seaweed2.png'
];
const bubbleImages = [
    'Assets/fish-photobooth/camerapage/stickers/bubble1.png',
    'Assets/fish-photobooth/camerapage/stickers/bubble2.png'
];
let seaweedIndex = 0, bubbleIndex = 0;

addSeaweedBtn.addEventListener('click', () => {
    addSticker(seaweedImages[seaweedIndex]);
    seaweedIndex = (seaweedIndex + 1) % seaweedImages.length;
});
addAxBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/axolotl.png'));
addBubbleBtn.addEventListener('click', () => {
    addSticker(bubbleImages[bubbleIndex]);
    bubbleIndex = (bubbleIndex + 1) % bubbleImages.length;
});

// reset
resetBtn.addEventListener('click', () => {
    stickers = [];
    drawCanvas();
});

// download
downloadBtn.addEventListener('click', () => {
    canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'fish-photobooth.png';
        a.click();
    }, 'image/png');
});

// home & logo
homeBtn.addEventListener('click', () => window.location.href = 'index.html');
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});

// redraw on filter change
if (filterSelect) filterSelect.addEventListener('change', drawCanvas);
