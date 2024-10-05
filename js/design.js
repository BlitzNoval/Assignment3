// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Event listener for the view buttons
    const buttons = document.querySelectorAll('.view-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const link = button.getAttribute('data-link');
            window.open(link, '_blank'); // Open link in new tab
        });
    });
});
