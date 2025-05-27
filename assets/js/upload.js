// PDF.js CDN config
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const thumbnailsContainer = document.getElementById('thumbnailsContainer');

// Initialize: Load existing PDF thumbnails
document.addEventListener('DOMContentLoaded', loadExistingPDFs);

// Load all PDFs from pdf-container
async function loadExistingPDFs() {
  try {
    const response = await fetch('pdf-container/');
    if (!response.ok) return;
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const pdfLinks = [...doc.querySelectorAll('a[href$=".pdf"]')];
    
    for (const link of pdfLinks) {
      const pdfUrl = `pdf-container/${link.getAttribute('href')}`;
      await createThumbnailFromUrl(pdfUrl, link.textContent);
    }
  } catch (error) {
    console.log('No existing PDFs found or CORS issue');
  }
}

// Create thumbnail from uploaded file
async function handleFiles(files) {
  for (const file of files) {
    if (file.type === 'application/pdf') {
      // Simulate upload (in real app, use FormData to send to server)
      const pdfUrl = URL.createObjectURL(file);
      await createThumbnailFromUrl(pdfUrl, file.name);
      
      // For GitHub Pages demo, we'll use localStorage as a fake "server"
      localStorage.setItem(`pdf-${file.name}`, pdfUrl);
    }
  }
}

// Create thumbnail from URL
async function createThumbnailFromUrl(url, filename) {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: viewport
    }).promise;
    
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';
    thumbnail.innerHTML = `
      <img src="${canvas.toDataURL()}" class="thumbnail-img">
      <div class="thumbnail-title">${filename}</div>
    `;
    
    thumbnail.addEventListener('click', () => {
      window.location.href = `viewer.html?file=${encodeURIComponent(filename)}`;
    });
    
    thumbnailsContainer.appendChild(thumbnail);
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

// Rest of your drag-drop code remains the same...
