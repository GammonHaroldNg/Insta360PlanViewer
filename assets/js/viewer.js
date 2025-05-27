// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.js';

// DOM elements
const pdfCanvas = document.getElementById('pdfCanvas');
const markersLayer = document.getElementById('markersLayer');
const backBtn = document.getElementById('backBtn');
const markBtn = document.getElementById('markBtn');
const moveBtn = document.getElementById('moveBtn');
const fileName = document.getElementById('fileName');

// State variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let markers = [];
let nextMarkerNumber = 1;
let isMarkingMode = false;
let isMoveMode = false;
let selectedMarker = null;
let canvasOffset = { x: 0, y: 0 };

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Get PDF filename from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pdfFile = urlParams.get('file');
    fileName.textContent = pdfFile || 'Untitled.pdf';
    
    // Load PDF
    loadPDF(pdfFile);
    
    // Set up event listeners
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    markBtn.addEventListener('click', toggleMarkingMode);
    moveBtn.addEventListener('click', toggleMoveMode);
    
    pdfCanvas.addEventListener('dblclick', handleCanvasDoubleClick);
    pdfCanvas.addEventListener('click', handleCanvasClick);
    
    window.addEventListener('resize', debounce(() => {
        if (pdfDoc) {
            renderPage(pageNum);
        }
    }, 250));
});

// Load PDF file
function loadPDF(file) {
    // In a real app, you would fetch the actual file
    // For GitHub Pages demo, we'll use a sample PDF
    const pdfPath = file ? `samples/${file}` : 'samples/sample.pdf';
    
    pdfjsLib.getDocument(pdfPath).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        renderPage(1);
        loadMarkers();
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. Please try another file.');
    });
}

// Render PDF page
function renderPage(num) {
    pageRendering = true;
    
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;
        
        // Calculate canvas offset for marker positioning
        const container = pdfCanvas.parentElement;
        canvasOffset.x = (container.clientWidth - pdfCanvas.width) / 2;
        canvasOffset.y = 0;
        
        const renderContext = {
            canvasContext: pdfCanvas.getContext('2d'),
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
            
            // Redraw markers after rendering
            drawMarkers();
        });
    });
}

// Marker functions
function createMarker(x, y, number = nextMarkerNumber) {
    const marker = {
        id: Date.now(),
        x: x,
        y: y,
        number: number,
        page: pageNum
    };
    
    markers.push(marker);
    nextMarkerNumber++;
    drawMarker(marker);
    saveMarkers();
    return marker;
}

function drawMarker(marker) {
    // Remove existing marker element if it exists
    const existingMarker = document.getElementById(`marker-${marker.id}`);
    if (existingMarker) {
        existingMarker.remove();
    }
    
    const markerElement = document.createElement('div');
    markerElement.className = 'marker';
    markerElement.id = `marker-${marker.id}`;
    markerElement.textContent = marker.number;
    markerElement.style.left = `${marker.x + canvasOffset.x}px`;
    markerElement.style.top = `${marker.y + canvasOffset.y}px`;
    
    if (isMoveMode) {
        markerElement.draggable = true;
        markerElement.addEventListener('dragstart', (e) => {
            selectedMarker = marker;
            e.dataTransfer.setData('text/plain', marker.id);
            e.dataTransfer.effectAllowed = 'move';
        });
    }
    
    markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMarkingMode) {
            deleteMarker(marker.id);
        } else if (isMoveMode) {
            selectedMarker = marker;
        }
    });
    
    markersLayer.appendChild(markerElement);
}

function drawMarkers() {
    // Clear existing markers
    markersLayer.innerHTML = '';
    
    // Draw markers for current page
    markers.filter(m => m.page === pageNum).forEach(marker => {
        drawMarker(marker);
    });
}

function deleteMarker(id) {
    markers = markers.filter(m => m.id !== id);
    const markerElement = document.getElementById(`marker-${id}`);
    if (markerElement) {
        markerElement.remove();
    }
    saveMarkers();
}

// Event handlers
function handleCanvasDoubleClick(e) {
    if (!isMarkingMode) return;
    
    const rect = pdfCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasOffset.x;
    const y = e.clientY - rect.top - canvasOffset.y;
    
    // Check if click is within canvas bounds
    if (x >= 0 && x <= pdfCanvas.width && y >= 0 && y <= pdfCanvas.height) {
        createMarker(x, y);
    }
}

function handleCanvasClick(e) {
    if (selectedMarker && isMoveMode) {
        const rect = pdfCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvasOffset.x;
        const y = e.clientY - rect.top - canvasOffset.y;
        
        if (x >= 0 && x <= pdfCanvas.width && y >= 0 && y <= pdfCanvas.height) {
            // Update marker position
            selectedMarker.x = x;
            selectedMarker.y = y;
            drawMarker(selectedMarker);
            saveMarkers();
            selectedMarker = null;
        }
    }
}

// Mode toggles
function toggleMarkingMode() {
    isMarkingMode = !isMarkingMode;
    isMoveMode = false;
    
    if (isMarkingMode) {
        markBtn.classList.add('active');
        moveBtn.classList.remove('active');
    } else {
        markBtn.classList.remove('active');
    }
}

function toggleMoveMode() {
    isMoveMode = !isMoveMode;
    isMarkingMode = false;
    
    if (isMoveMode) {
        moveBtn.classList.add('active');
        markBtn.classList.remove('active');
    } else {
        moveBtn.classList.remove('active');
        selectedMarker = null;
    }
}

// Storage functions
function saveMarkers() {
    localStorage.setItem(`markers-${fileName.textContent}`, JSON.stringify(markers));
    localStorage.setItem(`nextMarkerNumber-${fileName.textContent}`, nextMarkerNumber.toString());
}

function loadMarkers() {
    const savedMarkers = localStorage.getItem(`markers-${fileName.textContent}`);
    const savedNumber = localStorage.getItem(`nextMarkerNumber-${fileName.textContent}`);
    
    if (savedMarkers) {
        markers = JSON.parse(savedMarkers);
    }
    
    if (savedNumber) {
        nextMarkerNumber = parseInt(savedNumber);
    }
    
    drawMarkers();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
