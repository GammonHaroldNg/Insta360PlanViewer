// Set PDF.js worker path (CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const thumbnailsContainer = document.getElementById('thumbnailsContainer');

// Handle drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() { dropZone.classList.add('highlight'); }
function unhighlight() { dropZone.classList.remove('highlight'); }

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
}

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

// Process uploaded files
async function handleFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf') {
            await createThumbnail(file);
        }
    }
}

// Create PDF thumbnail
async function createThumbnail(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        }).promise;
        
        // Create thumbnail element
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.innerHTML = `
            <img src="${canvas.toDataURL()}" class="thumbnail-img">
            <div class="thumbnail-title">${file.name}</div>
        `;
        
        thumbnail.addEventListener('click', () => {
            window.location.href = `viewer.html?file=${encodeURIComponent(file.name)}`;
        });
        
        thumbnailsContainer.appendChild(thumbnail);
    } catch (error) {
        console.error('Error generating thumbnail:', error);
    }
}
