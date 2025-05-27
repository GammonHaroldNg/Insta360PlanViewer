// PDF.js config
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('thumbnailsContainer');
    
    try {
        // Fetch list of PDFs from pdf-container
        const response = await fetch('pdf-container/');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const pdfLinks = [...doc.querySelectorAll('a[href$=".pdf"]')];
        
        if (pdfLinks.length === 0) {
            container.innerHTML = '<div class="loading">No PDF files found in /pdf-container/</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // Generate thumbnails for each PDF
        for (const link of pdfLinks) {
            const pdfUrl = `pdf-container/${link.getAttribute('href')}`;
            await createThumbnail(pdfUrl, link.textContent);
        }
    } catch (error) {
        console.error('Error loading PDFs:', error);
        container.innerHTML = '<div class="loading">Error loading PDF thumbnails</div>';
    }
});

async function createThumbnail(pdfUrl, filename) {
    try {
        // Load first page for thumbnail
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
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
        thumbnail.innerHTML = `
            <img src="${canvas.toDataURL()}" class="thumbnail-img" alt="${filename}">
            <div class="thumbnail-title">${filename}</div>
        `;
        
        // Link to viewer
        thumbnail.addEventListener('click', () => {
            window.location.href = `viewer.html?file=${encodeURIComponent(filename)}`;
        });
        
        document.getElementById('thumbnailsContainer').appendChild(thumbnail);
    } catch (error) {
        console.error(`Error generating thumbnail for ${filename}:`, error);
    }
}
