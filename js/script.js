// Function to dynamically inject the navbar
function injectNavbar() {
    const pages = [
        { name: "Home", link: "index.html" },
        { name: "Design", link: "Design.html" },
        { name: "Data Visuals", link: "DataVisuals.html" },
        { name: "Theory", link: "Theory.html" },
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

// Function to dynamically inject the footer
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
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Theory</a></li>
                        <li><a href="#">Data Visuals</a></li>
                        <li><a href="#">Design</a></li>
                    </ul>
                </div>
                <div class="footer-social">
                    <h3>Follow Us</h3>
                    <ul>
                        <li><a href="#" class="social-icon">Instagram</a></li>
                        <li><a href="#" class="social-icon">GitHub</a></li>
                        <li><a href="#" class="social-icon">Twitter</a></li>
                    </ul>
                </div>
                <div class="footer-newsletter">
                    <h3>Subscribe to Our Newsletter</h3>
                    <form>
                        <input type="email" placeholder="Enter your email">
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
}

// Call the functions on page load
document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
});