// Example: Fetching data (you'll implement this on your server-side)
async function fetchData() {
    try {
        const response = await fetch('/api/steam-top-games'); // Adjust to your server endpoint
        const data = await response.json();
        visualizeData(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function visualizeData(data) {
    const width = 800;
    const height = 600;

    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Example: Create circles for each game
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => (i + 1) * 40)
        .attr("cy", height / 2)
        .attr("r", d => d.live_player_count / 1000) // Scale the radius
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "steelblue");
        });

    // Add more interactive features here, like sorting and filtering
}

fetchData();