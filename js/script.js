// Function to dynamically inject the navbar
function injectNavbar() {
    const pages = [
        { name: "Home", link: "./home.html" },
        { name: "Design", link: "./design.html" },
        { name: "Data Visuals", link: "./datavisuals.html" },
        { name: "Theory", link: "./theory.html" }
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
                        <li><a href="./index.html">Home</a></li>
                        <li><a href="./pages/theory.html">Theory</a></li>
                        <li><a href="./pages/datavisuals.html">Data Visuals</a></li>
                        <li><a href="./pages/design.html">Design</a></li>
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

document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
});
