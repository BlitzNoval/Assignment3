// script.js

// Function to dynamically inject the navbar
function injectNavbar() {
    const pages = [
        { name: "Home", link: "index.html" },
        { name: "Design", link: "Design.html" },
        { name: "Data Visuals", link: "DataVisuals.html" },
        { name: "Theory", link: "Theory.html" }
    ];

    const navBar = document.querySelector('header nav');
    let navHTML = '<ul id="dynamic-nav">';

    pages.forEach(page => {
        // Highlight the active page
        const isActive = window.location.pathname.includes(page.link) ? 'active' : '';
        navHTML += `<li><a href="${page.link}" class="${isActive}">${page.name}</a></li>`;
    });

    navHTML += '</ul>';
    navBar.innerHTML = navHTML;
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', injectNavbar);
