function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('section-' + sectionId).style.display = 'block';
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('section-' + sectionId).style.display = 'block';
}

function showPDF() {
    const iframe = document.querySelector('#pdf-viewer iframe');
    iframe.src = '../essays/Essay.pdf'; // Change this to the correct path
    document.getElementById('pdf-viewer').style.display = 'block';
}