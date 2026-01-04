// constants
const WIDTH = 1176, HEIGHT = 1470, HALF = HEIGHT / 2; 

// DOM elements (with null checks for debugging) 
const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  downloadBtn: document.getElementById('downloadBtn'),
  countdownEl: document.querySelector('.countdown-timer')
};

// After defining elements, add: 
// Null checks (add more if needed, e.g., for takePhotoBtn)
if (!elements.video) console.error('Video element not found!');
if (!elements.canvas) console.error('Canvas element not found!');
if (!elements.ctx) console.error('Canvas context not found!');
if (!elements.takePhotoBtn) console.error('Take photo button not found!'); 
if (!elements.countdownEl) console.error('Countdown element not found!'); 
// Etc

// Add initCamera function
// Initialize camera (with mobile front-camera preference)
async function initCamera() { 
  try {
    // Add facingMode for mobile front-camera preference 
    // Constraints: Prioritizes front-facing camera on mobile
    const constraints = { video: { facingMode: 'user' } }; 
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    elements.video.srcObject = stream;
    elements.video.play();
    moveVideoToHalf(0); // Start with top half 
  } catch (err) {
    console.error('Camera access failed:', err);
    alert('Camera access is required. Please allow permissions and try again.');
  }
} 

// Add event listener for take photo 
// Event listener for take photo button 
elements.takePhotoBtn.addEventListener('click', () => { 
  elements.takePhotoBtn.disabled = true; // Prevent spamming 
  startCountdown(capturePhoto);
});

// Call init on load 
window.addEventListener('DOMContentLoaded', initCamera);

let photoStage = 0; // 0=top,1=bottom,2=done

// move video to half
const moveVideoToHalf = i => {
  const { video } = elements;
  video.style.display = 'block';
  video.style.top = i === 0 ? '0' : '50%';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '50%';
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

// capture photo
const capturePhoto = () => {
  const { video, ctx, takePhotoBtn } = elements;
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

  ctx.save();
  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, yOffset, WIDTH, HALF);
  ctx.restore();

   photoStage++;
  if (photoStage === 1) { 
    moveVideoToHalf(1); 
    takePhotoBtn.disabled = false; 
  } else if (photoStage === 2) {
    finalizePhotoStrip();
  }
};

// finalize photo strip
const finalizePhotoStrip = () => {
  const { video, ctx, canvas } = elements;
  video.style.display = 'none';
  const frame = new Image();
  frame.src = './Assets/photobooth/camerapage/frame.png'; // Corrected path (relative to root)
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    setTimeout(() => window.location.href = 'final.html', 50);
  };
  if (frame.complete) frame.onload(); // Handle cached images 
};
