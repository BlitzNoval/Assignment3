// Array to store page links and titles
let pages = [
    { name: "Home", link: "index.html" },
    { name: "About", link: "about.html" },
    { name: "Design", link: "./pages/design.html" }
];

// Function to generate the navigation bar
function generateNavBar() {
    const nav = document.querySelector('nav');
    nav.innerHTML = ''; // Clear the nav content

    const ul = document.createElement('ul'); // Create an unordered list for nav items

    pages.forEach(page => {
        const li = document.createElement('li'); // List item for each page
        const a = document.createElement('a'); // Anchor tag for link

        a.textContent = page.name; // Set the link text
        a.href = page.link; // Set the href for the link
        li.appendChild(a); // Append the link to the list item
        ul.appendChild(li); // Append the list item to the unordered list
    });

    nav.appendChild(ul); // Append the list to the nav
}

// Function to add a new page dynamically
function addPage(name, link) {
    pages.push({ name, link }); // Add the new page to the array
    generateNavBar(); // Re-generate the nav bar to include the new page
}

// Run the generateNavBar function when the page loads
window.onload = function() {
    generateNavBar();
};
