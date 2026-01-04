// constants
const WIDTH = 1176, HEIGHT = 1470, HALF = HEIGHT / 2; 

// DOM elements
const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  downloadBtn: document.getElementById('downloadBtn'),
  countdownEl: document.querySelector('.countdown-timer'),
  filterSelect: document.getElementById('filterSelect')
};

let photoStage = 0; // 0=top, 1=bottom, 2=done
let capturedImages = []; // store the top and bottom captured frames

// move video preview to top or bottom half
const moveVideoToHalf = i => {
  const { video } = elements;
  video.style.display = 'block';
  video.style.top = i === 0 ? '0' : '50%';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '50%';
};

// live preview loop
const updateLivePreview = () => {
  const { video, ctx, filterSelect } = elements;
  if (video.paused || video.ended || photoStage === 2) return;

  const yOffset = photoStage === 0 ? 0 : HALF;
  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = WIDTH / HALF, vAspect = vW / vH;
  let sx, sy, sw, sh;

  if (vAspect > targetAspect) {
    sh = vH;
    sw = vH * targetAspect;
    sx = (vW - sw) / 2;
    sy = 0;
  } else {
    sw = vW;
    sh = vW / targetAspect;
    sx = 0;
    sy = (vH - sh) / 2;
  }

  ctx.clearRect(0, yOffset, WIDTH, HALF); // clear only the half being previewed
  ctx.save();
  ctx.filter = filterSelect.value || 'none';
  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1); // mirror
  ctx.drawImage(video, sx, sy, sw, sh, 0, yOffset, WIDTH, HALF);
  ctx.restore();

  requestAnimationFrame(updateLivePreview);
};

// countdown
const startCountdown = callback => {
  let count = 3;
  const { countdownEl } = elements;
  countdownEl.textContent = count;
  countdownEl.style.display = 'flex';
  const intervalId = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else {
      clearInterval(intervalId);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
};

// capture photo (freeze current frame)
const capturePhoto = () => {
  const { ctx, canvas } = elements;
  const img = document.createElement('canvas');
  img.width = WIDTH;
  img.height = HALF;
  img.getContext('2d').drawImage(canvas, 0, photoStage * HALF, WIDTH, HALF, 0, 0, WIDTH, HALF);
  capturedImages.push(img);

  photoStage++;

  if (photoStage < 2) {
    moveVideoToHalf(1); // move video to bottom half
    elements.takePhotoBtn.disabled = false;
  } else {
    finalizePhotoStrip();
  }
};

// finalize photo strip (draw both halves + frame)
const finalizePhotoStrip = () => {
  const { video, ctx, canvas } = elements;
  video.style.display = 'none';

  // draw top and bottom captured images
  capturedImages.forEach((img, i) => {
    ctx.drawImage(img, 0, 0, WIDTH, HALF, 0, i * HALF, WIDTH, HALF);
  });

  // draw frame with corrected path
  const frame = new Image();
  frame.src = 'assets/photobooth/camerapage/stickers/frame.png'; // <-- corrected path here
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);

    // Save the final photo strip in localStorage (optional)
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));

    // Redirect to final page after a brief delay
    setTimeout(() => window.location.href = 'final.html', 50);
  };
  // if image already loaded, call onload immediately
  frame.complete && frame.onload();
};

// download photo (if user wants a quick download)
const downloadPhoto = () => {
  elements.canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'photo-strip.png';
    a.click();
  }, 'image/png');
};

// setup camera
const setupCamera = () => {
  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 2560 }, height: { ideal: 1440 }, facingMode: 'user' }, audio: false })
    .then(stream => {
      elements.video.srcObject = stream;
      elements.video.play();
      moveVideoToHalf(0);
      requestAnimationFrame(updateLivePreview);
    })
    .catch(err => alert('Camera access failed: ' + err));
};

// setup event listeners
const setupEventListeners = () => {
  const { takePhotoBtn, downloadBtn, filterSelect } = elements;

  takePhotoBtn.addEventListener('click', () => {
    if (photoStage >= 2) return;
    takePhotoBtn.disabled = true;
    startCountdown(capturePhoto);
  });

  downloadBtn.addEventListener('click', downloadPhoto);

  // filter changes automatically applied via updateLivePreview
  filterSelect.addEventListener('input', () => {});

  window.addEventListener('resize', () => {
    if (photoStage === 0) moveVideoToHalf(0);
    else if (photoStage === 1) moveVideoToHalf(1);
  });
};

// initialize
const initPhotoBooth = () => { setupCamera(); setupEventListeners(); };
initPhotoBooth();

// logo redirect
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});
