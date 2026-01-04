window.addEventListener('DOMContentLoaded', () => {
  // clear local storage
  localStorage.removeItem('photoStrip');

  // constants
  const WIDTH = 1176, HEIGHT = 1470, HALF = HEIGHT / 2;

  let uploadedImages = []; // store top and bottom uploaded photos
  let currentPreviewIndex = null; // track which photo is currently being previewed
  let photoStage = 0; // 0=top, 1=bottom, 2=done

  // dom elements
  const elements = {
    canvas: document.getElementById('finalCanvas'),
    ctx: document.getElementById('finalCanvas').getContext('2d'),
    uploadInput: document.getElementById('uploadPhotoInput'),
    uploadBtn: document.getElementById('uploadPhoto'),
    readyBtn: document.getElementById('readyButton'),
    downloadBtn: document.getElementById('downloadBtn'),
    filterSelect: document.getElementById('filterSelect')
  };

  // draw uploaded photo
  const drawPhoto = img => {
    uploadedImages.push(img);
    currentPreviewIndex = uploadedImages.length - 1;
    redrawCanvas();
    photoStage++;
    if (photoStage === 2) finalizePhotoStrip();
  };

  // redraw canvas
  const redrawCanvas = () => {
    const { ctx, filterSelect } = elements;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    uploadedImages.forEach((img, i) => {
      const yOffset = i === 0 ? 0 : HALF;
      const imgAspect = img.width / img.height;
      const targetAspect = WIDTH / HALF;
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

      // Apply filter only to the live preview photo
      ctx.filter = (i === currentPreviewIndex) ? (filterSelect.value || 'none') : 'none';
      ctx.drawImage(img, sx, sy, sw, sh, 0, yOffset, WIDTH, HALF);
      ctx.filter = 'none';
    });
  };

  // filter change live preview
  if (elements.filterSelect) {
    elements.filterSelect.addEventListener('input', () => {
      if (uploadedImages.length === 0) return;
      redrawCanvas();
    });
  }

  // finalize photo strip
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
    frame.src = 'Assets/fish-photobooth/camerapage/frame.png';
  };

  // ready button
  elements.readyBtn.addEventListener('click', () => {
    localStorage.setItem('photoStrip', elements.canvas.toDataURL('image/png'));
    window.location.href = 'final.html';
  });

  // download photo
  const downloadPhoto = () => {
    const { canvas } = elements;
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'photo-strip.png';
      a.click();
    }, 'image/png');
  };
  elements.downloadBtn.addEventListener('click', downloadPhoto);

  // upload button
  elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());

  // handle upload
  elements.uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      drawPhoto(img);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
    elements.uploadInput.value = '';
  });

  // logo redirect
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});
