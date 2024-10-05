function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('show'); // Use classList to hide sections
        section.style.display = 'none'; // Hide by default to prevent layout shift
    });

    // Reset the PDF viewer
    document.getElementById('pdf-viewer').style.display = 'none';
    document.querySelector('#pdf-viewer iframe').src = '';

    // Show the selected section
    const currentSection = document.getElementById('section-' + sectionId);
    currentSection.style.display = 'block'; // Show section
    setTimeout(() => {
        currentSection.classList.add('show'); // Fade in
    }, 10); // Timeout to allow display to be applied first
}

function showPDF() {
    const iframe = document.querySelector('#pdf-viewer iframe');
    iframe.src = '../essays/Essay.pdf'; // Change this to the correct path
    document.getElementById('pdf-viewer').style.display = 'block';
}