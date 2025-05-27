// Set PDF.js worker path (CDN)
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

// Load PDF (using a sample if no file specified)
function loadPDF(file) {
    const pdfPath = file ? `samples/${file}` : 'samples/sample.pdf';
    
    pdfjsLib.getDocument(pdfPath).promise
        .then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            renderPage(1);
            loadMarkers();
        })
        .catch(error => {
            console.error('PDF load error:', error);
            alert('Error loading PDF. Please try another file.');
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
