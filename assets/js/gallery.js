// Load PDF thumbnails
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('thumbnailsContainer');
    
    try {
        const response = await fetch('PdfContainer/');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const pdfLinks = [...doc.querySelectorAll('a[href$=".pdf"]')];
        
        pdfLinks.forEach(link => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.innerHTML = `
                <img src="assets/pdf-icon.png" alt="PDF">
                <div>${link.textContent}</div>
            `;
            thumbnail.addEventListener('click', () => {
                window.location.href = `viewer.html?file=${encodeURIComponent(link.getAttribute('href'))}`;
            });
            container.appendChild(thumbnail);
        });
    } catch (error) {
        console.error('Error loading PDFs:', error);
    }
});
