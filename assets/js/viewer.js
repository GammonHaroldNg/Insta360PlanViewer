// PDF viewer functionality
let pdfDoc = null;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pdfFile = urlParams.get('file');
    
    if (pdfFile) {
        loadPDF(`PdfContainer/${pdfFile}`);
    }
});

function loadPDF(url) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        renderPage(1);
    });
}

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.getElementById('pdfCanvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        page.render({
            canvasContext: context,
            viewport: viewport
        });
    });
}
