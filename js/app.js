const typeChart = d3.select("#typeChart");
const evolutionChart = d3.select("#evolutionChart");
const selectedTypes = new Set();

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("display", "none");

// Fetch Pokémon types and evolution data
async function fetchPokemonData() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const data = await response.json();
    return data.results;
}

async function fetchTypeDistribution() {
    const pokemons = await fetchPokemonData();
    const typeCount = {};
    const typeDetails = {};

    for (const pokemon of pokemons) {
        const details = await fetch(pokemon.url);
        const data = await details.json();
        data.types.forEach(type => {
            const typeName = type.type.name;
            typeCount[typeName] = (typeCount[typeName] || 0) + 1;
            typeDetails[typeName] = typeDetails[typeName] || data;
        });
    }

    drawTypeDistributionChart(typeCount, typeDetails);
}


// Dynamically create checkboxes for filtering types
function createFilterCheckboxes(typeCount) {
    const filterContainer = d3.select("#filters");
    filterContainer.selectAll("*").remove(); // Clear existing checkboxes

    Object.keys(typeCount).forEach(type => {
        filterContainer.append("label")
            .text(type)
            .append("input")
            .attr("type", "checkbox")
            .attr("value", type)
            .on("change", function () {
                if (this.checked) {
                    selectedTypes.add(type);
                } else {
                    selectedTypes.delete(type);
                }
                drawTypeDistributionChart(typeCount);
            });
    });
}

// Draw type distribution bubbles
function drawTypeDistributionChart(typeCount, typeDetails) {
    typeChart.selectAll("*").remove(); // Clear previous chart

    const width = +typeChart.attr("width");
    const height = +typeChart.attr("height");

    const nodes = Object.entries(typeCount)
        .filter(([type]) => selectedTypes.size === 0 || selectedTypes.has(type))
        .map(([type, count]) => ({ type, count }));

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(Object.values(typeCount))])
        .range([5, 50]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => radiusScale(d.count) + 2))
        .on("tick", ticked);

    function ticked() {
        const bubbles = typeChart.selectAll("circle")
            .data(nodes);

        bubbles.enter()
            .append("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => color(d.type))
            .merge(bubbles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on("mouseover", (event, d) => {
                tooltip.style("display", "block")
                    .html(`Type: ${d.type} <br> Count: ${d.count} <br> <img src="${typeDetails[d.type].sprites.front_default}" alt="${d.type}" width="50">`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });

        bubbles.exit().remove();
    }

    createFilterCheckboxes(typeCount);
}

// Evolution chain fetching and visualization
async function fetchEvolutionChain(pokemonName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        const pokemon = await response.json();
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`);
        const species = await speciesResponse.json();
        const evolutionChainResponse = await fetch(species.evolution_chain.url);
        const evolutionChain = await evolutionChainResponse.json();
        drawEvolutionChain(evolutionChain.chain);
    } catch (err) {
        alert('Pokémon not found. Please try again.');
    }
}

function drawEvolutionChain(chain) {
    evolutionChart.selectAll("*").remove(); // Clear previous chart

    const width = 800, height = 600;
    const svg = evolutionChart.append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const nodes = [];
    const links = [];

    function buildChain(node, parent = null, depth = 0) {
        nodes.push({ 
            name: node.species.name, 
            url: node.species.url,
            depth: depth
        });
        if (parent) {
            links.push({ source: parent, target: node.species.name });
        }
        node.evolves_to.forEach(e => buildChain(e, node.species.name, depth + 1));
    }

    buildChain(chain);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.name).distance(150))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("x", d3.forceX(d => width / 2 + (d.depth - 1) * 200).strength(0.5))
        .force("y", d3.forceY(height / 2).strength(0.1));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#999")
        .style("stroke", "none");

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", 30)
        .attr("fill", "white")
        .attr("stroke", "#666")
        .attr("stroke-width", 2);

    node.append("image")
        .attr("xlink:href", d => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(d.url)}.png`)
        .attr("x", -25)
        .attr("y", -25)
        .attr("width", 50)
        .attr("height", 50);

    node.append("text")
        .attr("dy", 50)
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", "#333");

    node.on("mouseover", function(event, d) {
        d3.select(this).select("circle").transition()
            .duration(300)
            .attr("r", 35)
            .attr("fill", "#ffcb05");

        tooltip.style("display", "block")
            .html(`
                <strong>${d.name}</strong><br>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(d.url)}.png" alt="${d.name}" width="96"><br>
                ID: ${getPokemonId(d.url)}
            `);
    })
    .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this).select("circle").transition()
            .duration(300)
            .attr("r", 30)
            .attr("fill", "white");

        tooltip.style("display", "none");
    })
    .on("click", (event, d) => {
        // Highlight clicked Pokémon and its direct evolutions
        node.select("circle")
            .attr("fill", n => n === d || links.some(l => (l.source === d && l.target === n) || (l.target === d && l.source === n)) ? "#ffcb05" : "white");
    });

    simulation.on("tick", () => {
        link.attr("d", d => {
            const dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy);
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function getPokemonId(url) {
        const parts = url.split("/");
        return parts[parts.length - 2];
    }
}
// Event listener for fetching evolution chain
document.getElementById('fetchEvolution').addEventListener('click', () => {
    const pokemonName = document.getElementById('pokemonInput').value;
    fetchEvolutionChain(pokemonName);
});

// Fetch and display Pokémon type distribution initially
fetchTypeDistribution();

