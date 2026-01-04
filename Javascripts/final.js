// constants
const WIDTH = 1176, HEIGHT = 1470;

// dom elements
const canvas = document.getElementById('finalCanvas'),
      ctx = canvas.getContext('2d'),
      addsticker1Btn = document.getElementById('addsticker1'),
      addsticker2Btn = document.getElementById('addsticker2'),
      downloadBtn = document.getElementById('downloadBtn'),
      homeBtn = document.getElementById('homeBtn'),
      resetBtn = document.getElementById('reset');

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;

// load photo
const finalImage = new Image(), dataURL = localStorage.getItem('photoStrip');
if (dataURL) {
  finalImage.src = dataURL;
  finalImage.onload = drawCanvas;
  localStorage.removeItem('photoStrip');
} else alert("No photo found!");

// draw canvas
function drawCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
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

// pointer position
function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect(), scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  const clientX = e.touches?.[0]?.clientX ?? e.clientX,
        clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

// drag and drop
function pointerDown(e) {
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (mouseX >= s.x && mouseX <= s.x + s.width && mouseY >= s.y && mouseY <= s.y + s.height) {
      selectedSticker = s;
      s.dragging = true;
      dragOffset.x = mouseX - s.x;
      dragOffset.y = mouseY - s.y;
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
function pointerUp() { if (selectedSticker) selectedSticker.dragging = false; selectedSticker = null; }

// mouse events
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);

// touch events
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// stickers
addsticker1Btn.addEventListener('click', () => addSticker('Assets/photobooth/camerapage/stickers/sticker1.png'));
addsticker2Btn.addEventListener('click', () => addSticker('Assets/photobooth/camerapage/stickers/sticker2.png'));

const sticker1Images = ['Assets/photobooth/camerapage/stickers/sticker1.png','Assets//camerapage/photobooth/stickers/sticker1.png'], 
      sticker2Images = ['Assets/photobooth/camerapage/stickers/sticker2.png','Assets/photobooth/camerapage/stickers/sticker2.png'];
let sticker1Index = 0, sticker2Index = 0;

addsticker1Btn.addEventListener('click', () => { addSticker(sticker1Images[sticker1Index]); sticker1Index = (sticker1Index + 1) % sticker1Images.length; });
addsticker2Btn.addEventListener('click', () => addSticker('Assets/photobooth/camerapage/stickers/sticker2.png'));

// reset
resetBtn.addEventListener('click', () => { stickers = []; drawCanvas(); });

// download
downloadBtn.addEventListener('click', () => {
  canvas.toBlob(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'photobooth.png'; a.click(); }, 'image/png');
});

// home
homeBtn.addEventListener('click', () => window.location.href = 'index.html');

// logo
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});
