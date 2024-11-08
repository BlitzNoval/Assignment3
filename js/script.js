// Main script.js file
function injectNavbar() {
    const pages = [
        { name: "Home", link: "./home.html" },
        { name: "Design", link: "./design.html" },
        { name: "Data Visuals", link: "./datavisuals.html" },
        { name: "Theory", link: "./theory.html" }
    ];

    const navBar = document.querySelector('header nav');
    let navHTML = '<ul id="dynamic-nav">';
    
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop();

    pages.forEach(page => {
        // Extract filename from page.link for comparison
        const pagePath = page.link.split('/').pop();
        // Check if this is the current page
        const isActive = currentPage === pagePath ? 'active' : '';
        navHTML += `<li><a href="${page.link}" class="${isActive}">${page.name}</a></li>`;
    });

    navHTML += '</ul>';
    navBar.innerHTML = navHTML;
}

function injectFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-logo">
                    <img src="../images/Pokemon.png" alt="Pokémon Logo" class="footer-logo-img">
                </div>
                <div class="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="./home.html">Home</a></li>
                        <li><a href="./theory.html">Theory</a></li>
                        <li><a href="./datavisuals.html">Data Visuals</a></li>
                        <li><a href="./design.html">Design</a></li>
                    </ul>
                </div>
                <div class="footer-social">
                    <h3>Follow Us</h3>
                    <ul>
                        <li><a href="https://www.instagram.com/liamjm__/" class="social-icon">Instagram</a></li>
                        <li><a href="https://github.com/BlitzNoval" class="social-icon">GitHub</a></li>
                        <li><a href="https://x.com/shinobushes" class="social-icon">Twitter</a></li>
                    </ul>
                </div>
                <div class="footer-newsletter">
                    <h3>Subscribe to Our Newsletter</h3>
                    <form id="newsletter-form">
                        <input type="email" placeholder="Enter your email" required>
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Pokémon Fan Site | All Rights Reserved | 2024 September</p>
            </div>
        </footer>
    `;

    const body = document.querySelector('body');
    body.insertAdjacentHTML('beforeend', footerHTML);

    // Add newsletter form submission handler
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with: ${email}`);
            this.reset();
        });
    }
}

// Handle navigation click events
function handleNavigation() {
    const navLinks = document.querySelectorAll('#dynamic-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
    handleNavigation();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('#dynamic-nav a');
    
    navLinks.forEach(link => {
        const pagePath = link.getAttribute('href').split('/').pop();
        if (pagePath === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});