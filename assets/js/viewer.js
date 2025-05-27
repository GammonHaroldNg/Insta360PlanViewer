// PDF.js config
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// DOM elements
const pdfCanvas = document.getElementById('pdfCanvas');
const markersLayer = document.getElementById('markersLayer');
const backBtn = document.getElementById('backBtn');
const markBtn = document.getElementById('markBtn');
const moveBtn = document.getElementById('moveBtn');
const fileName = document.getElementById('fileName');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const pdfFile = new URLSearchParams(window.location.search).get('file');
    fileName.textContent = pdfFile || 'Untitled.pdf';
    loadPDF(pdfFile);
    
    backBtn.addEventListener('click', () => window.location.href = 'index.html');
    markBtn.addEventListener('click', toggleMarkingMode);
    moveBtn.addEventListener('click', toggleMoveMode);
    pdfCanvas.addEventListener('dblclick', handleCanvasDoubleClick);
    window.addEventListener('resize', debounce(() => renderPage(pageNum), 250);
});

// Load PDF from localStorage (or fake server)
function loadPDF(filename) {
    const pdfUrl = `pdf-container/${filename}`;
    
    pdfjsLib.getDocument(pdfUrl).promise
        .then(pdf => {
            pdfDoc = pdf;
            fileName.textContent = filename;
            renderPage(1);
        })
        .catch(error => {
            console.error('Failed to load PDF:', error);
            alert('PDF failed to load. Please try another file.');
            window.location.href = 'index.html';
        });
}

// Marker functions
function createMarker(x, y, number = nextMarkerNumber) {
    const marker = { id: Date.now(), x, y, number, page: pageNum };
    markers.push(marker);
    nextMarkerNumber++;
    drawMarker(marker);
    saveMarkers();
    return marker;
}

function drawMarker(marker) {
    const markerElement = document.createElement('div');
    markerElement.className = 'marker';
    markerElement.id = `marker-${marker.id}`;
    markerElement.textContent = marker.number;
    markerElement.style.left = `${marker.x + canvasOffset.x}px`;
    markerElement.style.top = `${marker.y + canvasOffset.y}px`;
    
    markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMarkingMode) deleteMarker(marker.id);
    });
    
    markersLayer.appendChild(markerElement);
}

// Rest of the viewer.js remains the same as previously provided...
