// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const thumbnailsContainer = document.getElementById('thumbnailsContainer');

// Handle drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('highlight');
}

function unhighlight() {
    dropZone.classList.remove('highlight');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

// Process uploaded files
async function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
            await createThumbnail(file);
        }
    }
}

// Create PDF thumbnail
async function createThumbnail(file) {
    const arrayBuffer = await file.arrayBuffer();
    
    try {
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        // Create thumbnail element
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        
        const img = document.createElement('img');
        img.className = 'thumbnail-img';
        img.src = canvas.toDataURL();
        
        const title = document.createElement('div');
        title.className = 'thumbnail-title';
        title.textContent = file.name;
        
        thumbnail.appendChild(img);
        thumbnail.appendChild(title);
        
        // Add click handler to open viewer
        thumbnail.addEventListener('click', () => {
            window.location.href = `viewer.html?file=${encodeURIComponent(file.name)}`;
        });
        
        thumbnailsContainer.appendChild(thumbnail);
    } catch (error) {
        console.error('Error generating thumbnail:', error);
    }
}
