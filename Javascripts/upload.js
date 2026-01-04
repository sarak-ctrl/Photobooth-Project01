// Clear localStorage on load
window.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('photoStrip');
  // Logo redirect (combined with above)
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});

// Constants
const WIDTH = 1176, HEIGHT = 1470, HALF = HEIGHT / 2;

// DOM elements (with null checks for debugging)
const elements = {
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas')?.getContext('2d'),  // Optional chaining for safety
  uploadInput: document.getElementById('uploadPhotoInput'),
  uploadBtn: document.getElementById('uploadPhoto'),
  readyBtn: document.getElementById('readyButton'),
  downloadBtn: document.getElementById('downloadBtn')
};

// Null checks (add more if needed)
if (!elements.canvas) console.error('Canvas element not found!');
if (!elements.ctx) console.error('Canvas context not found!');
if (!elements.uploadInput) console.error('Upload input not found!');
if (!elements.uploadBtn) console.error('Upload button not found!');
if (!elements.readyBtn) console.error('Ready button not found!');
if (!elements.downloadBtn) console.error('Download button not found!');

let photoStage = 0;  // 0=top, 1=bottom, 2=done

// Draw photo (with mirroring for consistency)
const drawPhoto = img => {
  const { ctx } = elements;
  const yOffset = photoStage === 0 ? 0 : HALF;
  const imgAspect = img.width / img.height, targetAspect = WIDTH / HALF;
  let sx, sy, sw, sh;

  if (imgAspect > targetAspect) {
    sh = img.height;
    sw = img.height * targetAspect;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / targetAspect;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  // Add mirroring (horizontal flip, like camera.js)
  ctx.save();
  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, sx, sy, sw, sh, 0, yOffset, WIDTH, HALF);
  ctx.restore();

  photoStage++;
  if (photoStage === 2) {
    finalizePhotoStrip();
  } else if (photoStage > 2) {
    alert('Only two photos are needed. Reset if you want to start over.');
  }
};

// Finalize photo strip
const finalizePhotoStrip = () => {
  const { ctx, readyBtn, downloadBtn, uploadBtn } = elements;
  const frame = new Image();
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    uploadBtn.style.display = 'none';
    readyBtn.style.display = 'inline-block';
    readyBtn.disabled = false;
    downloadBtn.style.display = 'inline-block';
  };
  frame.src = './Assets/photobooth/camerapage/frame.png';  // Corrected path
};

// Ready button
elements.readyBtn.addEventListener('click', () => {
  localStorage.setItem('photoStrip', elements.canvas.toDataURL('image/png'));
  window.location.href = 'final.html';
});

// Download photo
const downloadPhoto = () => {
  const { canvas } = elements;
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'photo-strip.png';
    a.click();
  }, 'image/png');
};

// Upload button
elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());

// Handle upload
elements.uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }
  const img = new Image();
  img.onload = () => drawPhoto(img);
  img.src = URL.createObjectURL(file);
  elements.uploadInput.value = '';  // Reset input
});

// Download button
elements.downloadBtn.addEventListener('click', downloadPhoto);
