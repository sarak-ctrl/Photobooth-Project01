// constants
const WIDTH = 1176, HEIGHT = 1470;

// DOM elements (with null checks for debugging)
const canvas = document.getElementById('finalCanvas');
const ctx = canvas?.getContext('2d'); // Optional chaining for safety 
const addsticker1Btn = document.getElementById('addsticker1'); 
const addsticker2Btn = document.getElementById('addsticker2'); 
const downloadBtn = document.getElementById('downloadBtn');
const homeBtn = document.getElementById('homeBtn'); 
const resetBtn = document.getElementById('reset');

// Null checks (add more if needed)
if (!canvas) console.error('Canvas element not found!'); 
if (!ctx) console.error('Canvas context not found!');
if (!addsticker1Btn) console.error('Add sticker1 button not found!');
if (!addsticker2Btn) console.error('Add sticker2 button not found!');
if (!downloadBtn) console.error('Download button not found!');
if (!homeBtn) console.error('Home button not found!');
if (!resetBtn) console.error('Reset button not found!'); 

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;

// sticker image arrays (for cycling; corrected paths)
const sticker1Images = [
  './Assets/photobooth/camerapage/stickers/sticker1.png',
  './Assets/photobooth/camerapage/stickers/sticker1.png'  // Duplicate for cycling; replace with different images if needed
];
const sticker2Images = [
  './Assets/photobooth/camerapage/stickers/sticker2.png',
  './Assets/photobooth/camerapage/stickers/sticker2.png'  // Duplicate for cycling; replace with different images if needed
];
let sticker1Index = 0, sticker2Index = 0;

// load photo from localStorage 
const finalImage = new Image();
const dataURL = localStorage.getItem('photoStrip');
if (dataURL) {
  finalImage.src = dataURL;
  finalImage.onload = drawCanvas;
  localStorage.removeItem('photoStrip'); // Cleanup 
} else {
      alert('No photo found! Returning to home.');
      window.location.href = 'index.html'; // Redirect if no photo 
}

// draw canvas
function drawCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// add sticker (with cycling)
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

// get pointer position (handles mouse/touch)
function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect(); 
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
  const clientX = e.touches?.[0]?.clientX ?? e.clientX;
       const clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

// drag and drop functions 
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
      stickers.push(s);  // Bring to front
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

// Mouse events
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);

// Touch events
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// Sticker button events (consolidated with cycling)
addsticker1Btn.addEventListener('click', () => {
  addSticker(sticker1Images[sticker1Index]);
  sticker1Index = (sticker1Index + 1) % sticker1Images.length;
});
addsticker2Btn.addEventListener('click', () => {
  addSticker(sticker2Images[sticker2Index]);
  sticker2Index = (sticker2Index + 1) % sticker2Images.length;
});

// Reset
resetBtn.addEventListener('click', () => {
  stickers = [];
  drawCanvas();
});

// Download
downloadBtn.addEventListener('click', () => {
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'photobooth.png';
    a.click();
  }, 'image/png');
});

// Home
homeBtn.addEventListener('click', () => window.location.href = 'index.html');

// Logo click (for navigation)
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});
