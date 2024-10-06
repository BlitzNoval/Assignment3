   // Animate loading bar with stops and starts
   function animateLoadingBar() {
    const loadingBar = document.getElementById('loadingBar');
    const loadingBarContainer = document.getElementById('loadingBarContainer');
    let loadPercentage = 0;

    // Intervals to simulate loading stops and starts
    const intervals = [
        { time: 500, increment: 30 },  // Fast start
        { time: 1000, increment: 20 }, // Small stop
        { time: 700, increment: 40 },  // Fast burst
        { time: 1500, increment: 10 }, // Pause moment
        { time: 800, increment: 100 }, // Final fast load
    ];

    let i = 0;

    function loadStep() {
        if (i < intervals.length) {
            const { time, increment } = intervals[i];
            setTimeout(() => {
                loadPercentage += increment;
                loadingBar.style.width = loadPercentage + '%';

                // Proceed to next step
                i++;
                loadStep();
            }, time);
        } else {
            // After loading completes, hide loading bar smoothly
            setTimeout(() => {
                loadingBarContainer.classList.add('fade-out');
                showEnterButton();
            }, 500);
        }
    }

    // Start loading
    loadStep();
}

// Show the enter button smoothly after loading completes
function showEnterButton() {
    document.getElementById("enterButton").style.display = "block";
}

// Start loading animation when page loads
window.onload = function () {
    animateLoadingBar();
};

// Cool entrance effect with shrinking both the Pokéball and Enter button
function enterPokeball() {
    const loader = document.getElementById("loader");
    const enterButton = document.getElementById("enterButton");
    const body = document.body;

    // Shrink Pokéball and fade it out
    loader.classList.add('shrink-fade');
    
    // Shrink the Enter button and fade it out
    enterButton.classList.add('shrink-fade');

    // Darken background smoothly
    body.style.backgroundColor = "#000000";

    // Redirect after the effect
    setTimeout(() => {
        window.location.href = "./Pages/theory.html";
    }, 1000);
}