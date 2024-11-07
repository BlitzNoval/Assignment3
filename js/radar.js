// Radar Chart and Team Builder Functionality
const team = [];
const maxTeamSize = 6;
let colorIndex = 0;

// Color Palette for distinct Pokémon colors
const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#FFD700', '#800080', '#FF6347', '#8A2BE2', '#20B2AA'];

// Event listener for adding a Pokémon
document.getElementById("add-pokemon").addEventListener("click", async () => {
    const pokemonName = document.getElementById("pokemon-input").value.toLowerCase();
    
    // Check if the team has reached the limit
    if (team.length >= maxTeamSize) {
        alert("Maximum team size reached. You cannot add more Pokémon.");
        return;
    }
    
    // Prevent adding empty or duplicate Pokémon
    if (!pokemonName.trim()) {
        alert("Please enter a valid Pokémon name.");
        return;
    }
    if (team.some(pokemon => pokemon.name.toLowerCase() === pokemonName)) {
        alert("This Pokémon is already in your team.");
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) throw new Error("Pokémon not found");
        const pokemonData = await response.json();
        pokemonData.color = colorPalette[colorIndex % colorPalette.length]; // Assign a unique color
        colorIndex++; // Increment to get a new color for the next Pokémon
        team.push(pokemonData); // Push the full Pokémon object to the team
        displayTeam();
    } catch (error) {
        alert("Pokémon not found. Please try again.");
    }
});

// Display selected team with remove buttons
function displayTeam() {
    const teamList = document.getElementById("team-list");
    teamList.innerHTML = "";
    team.forEach((pokemon, idx) => {
        const li = document.createElement("li");
        li.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removePokemon(idx); // Remove Pokémon from the team
        li.appendChild(removeButton);

        teamList.appendChild(li);
    });

    // Disable Add Pokémon button if team size is maxed
    document.getElementById("add-pokemon").disabled = team.length >= maxTeamSize;
}

// Remove Pokémon from the team
function removePokemon(index) {
    team.splice(index, 1); // Remove Pokémon from the array
    displayTeam(); // Re-render the team
    renderRadarChart(team); // Re-render the radar chart with updated team
}

// Analyze Team Button Event
document.getElementById("analyze-team").addEventListener("click", analyzeTeam);

async function analyzeTeam() {
    if (team.length === 0) {
        alert("Please add at least one Pokémon.");
        return;
    }

    // Fetch Pokémon data including stats
    const teamData = await Promise.all(team.map(async (pokemon) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
        const data = await response.json();
        return {
            name: data.name,
            stats: data.stats.map(stat => ({
                name: stat.stat.name,
                value: stat.base_stat
            })),
            color: pokemon.color // Include the color information for the radar chart
        };
    }));

    renderRadarChart(teamData);
}

// Render Radar Chart with Hover Info and Dynamic Updates
function renderRadarChart(teamData) {
    const stats = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
    const data = stats.map(stat => ({
        stat,
        values: teamData.map(pokemon => {
            const statObj = pokemon.stats.find(s => s.name === stat);
            return { name: pokemon.name, value: statObj ? statObj.value : 0 };
        })
    }));

    // D3.js Radar Chart Setup
    const svg = d3.select("#radar-chart").attr("width", 500).attr("height", 500);
    const radius = 200;
    const angleSlice = (Math.PI * 2) / stats.length;
    const rScale = d3.scaleLinear().domain([0, 200]).range([0, radius]);

    svg.selectAll("*").remove();

    // Draw Axes
    data.forEach((d, i) => {
        svg.append("line")
            .attr("x1", 250)
            .attr("y1", 250)
            .attr("x2", 250 + rScale(200) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", 250 + rScale(200) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("stroke", "#ddd");
    });

    // Draw Stat Labels
    data.forEach((d, i) => {
        svg.append("text")
            .attr("x", 250 + rScale(210) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", 250 + rScale(210) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(d.stat);
    });

    // Draw Data Polygons
    teamData.forEach((pokemon, idx) => {
        const points = stats.map((stat, i) => {
            const statValue = pokemon.stats.find(s => s.name === stat).value;
            return [
                250 + rScale(statValue) * Math.cos(angleSlice * i - Math.PI / 2),
                250 + rScale(statValue) * Math.sin(angleSlice * i - Math.PI / 2)
            ];
        });

        svg.append("polygon")
            .attr("points", points.map(d => d.join(",")).join(" "))
            .attr("fill", pokemon.color)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill-opacity", 0.5)
            .on("mouseover", function () {
                d3.select(this).attr("fill-opacity", 0.8); // Increase opacity on hover
                showTooltip(pokemon); // Display tooltip with Pokémon info
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill-opacity", 0.5); // Reset opacity
                hideTooltip(); // Hide the tooltip
            });
    });
}

// Tooltip for displaying Pokémon info on hover
function showTooltip(pokemon) {
    const tooltip = d3.select("#radar-chart-container").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("visibility", "visible")
        .html(`
            <strong>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</strong><br>
            HP: ${pokemon.stats.find(s => s.name === "hp").value}<br>
            Attack: ${pokemon.stats.find(s => s.name === "attack").value}<br>
            Defense: ${pokemon.stats.find(s => s.name === "defense").value}<br>
            Special Attack: ${pokemon.stats.find(s => s.name === "special-attack").value}<br>
            Special Defense: ${pokemon.stats.find(s => s.name === "special-defense").value}<br>
            Speed: ${pokemon.stats.find(s => s.name === "speed").value}
        `);
}

function hideTooltip() {
    d3.select("#tooltip").remove();
}
