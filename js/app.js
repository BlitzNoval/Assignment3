const typeChart = d3.select("#typeChart");
const evolutionChart = d3.select("#evolutionChart");
const selectedTypes = new Set();

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.9)")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)")
    .style("padding", "10px")
    .style("display", "none")
    .style("pointer-events", "none");

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

    const fetches = pokemons.map(async (pokemon) => {
        const details = await fetch(pokemon.url).then(res => res.json());
        details.types.forEach(type => {
            const typeName = type.type.name;
            typeCount[typeName] = (typeCount[typeName] || 0) + 1;
            if (!typeDetails[typeName]) {
                typeDetails[typeName] = { pokemons: [] };
            }
            typeDetails[typeName].pokemons.push({
                name: details.name,
                sprite: details.sprites.front_default
            });
        });
    });

    await Promise.all(fetches);
    createFilterDropdown(typeCount, typeDetails);
    drawTypeDistributionChart(typeCount, typeDetails);
}

// Create filter dropdown for Pokémon types
function createFilterDropdown(typeCount, typeDetails) {
    const filterContainer = d3.select("#filters");
    filterContainer.selectAll("*").remove();

    // Dropdown menu for filter options
    const dropdown = filterContainer.append("div")
        .attr("class", "dropdown");

    dropdown.append("button")
        .attr("class", "dropbtn")
        .text("Filter Types")
        .on("click", () => {
            document.getElementById("typeDropdown").classList.toggle("show");
        });

    const dropdownContent = dropdown.append("div")
        .attr("id", "typeDropdown")
        .attr("class", "dropdown-content");

    // "Clear All" option to reset the filter
    dropdownContent.append("button")
        .attr("class", "filter-option clear-button")
        .text("Clear All Filters")
        .on("click", () => {
            selectedTypes.clear();
            d3.selectAll(".filter-option").classed("active", false);
            drawTypeDistributionChart(typeCount, typeDetails);
        });

    Object.keys(typeCount).forEach(type => {
        dropdownContent.append("button")
            .attr("class", "filter-option")
            .text(type)
            .on("click", function () {
                const isActive = selectedTypes.has(type);
                if (isActive) {
                    selectedTypes.delete(type);
                } else {
                    selectedTypes.add(type);
                }
                d3.select(this).classed("active", !isActive);
                drawTypeDistributionChart(typeCount, typeDetails);
            });
    });
}

// Draw type distribution bubbles
function drawTypeDistributionChart(typeCount, typeDetails) {
    typeChart.selectAll("*").remove();

    const width = +typeChart.attr("width");
    const height = +typeChart.attr("height");

    const nodes = Object.entries(typeCount)
        .filter(([type]) => selectedTypes.size === 0 || selectedTypes.has(type))
        .map(([type, count]) => ({ type, count }));

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(Object.values(typeCount))])
        .range([20, 50]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => radiusScale(d.count) + 2))
        .on("tick", ticked);

    function ticked() {
        const bubbles = typeChart.selectAll("g").data(nodes);

        const bubbleEnter = bubbles.enter().append("g");

        bubbleEnter.append("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => color(d.type))
            .on("mouseover", (event, d) => {
                const details = typeDetails[d.type];
                const samplePokemons = details.pokemons.slice(0, 5);
                const pokemonList = samplePokemons.map(p => `
                    <div style="display: inline-block; text-align: center; margin: 5px;">
                        <img src="${p.sprite}" alt="${p.name}" width="40"><br>
                        <span style="font-size: 12px;">${p.name}</span>
                    </div>
                `).join('');

                tooltip.style("display", "block")
  .html(`
    <div class="tooltip-content">
      <div class="type-info">
        <div class="type-name" style="color: ${color(d.type)}; font-weight: 700; font-size: 18px; text-transform: capitalize;">${d.type}</div>
        <div class="count" style="font-weight: 500; font-size: 16px;">Count: <span class="count-value" style="font-weight: 700;">${d.count}</span></div>
      </div>
      <div class="pokemon-examples" style="margin-top: 12px;">
        <span class="label" style="color: #27ae60; font-weight: 600; font-size: 16px;">Pokémon Examples:</span>
        <div class="pokemon-list" style="font-size: 15px; line-height: 1.5; margin-top: 8px;">${pokemonList}</div>
      </div>
    </div>
  `)
  .style("opacity", 1);
            
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("display", "none"));

        bubbleEnter.append("text")
            .attr("dy", "-1em")
            .attr("text-anchor", "middle")
            .text(d => d.type)
            .style("font-size", "12px")
            .style("fill", "#333")
            .style("font-weight", "bold") // Add bold font weight
            .attr("dominant-baseline", "central") // Vertical centering
            .attr("transform", d => `translate(0, ${radiusScale(d.count) / 2})`); // Adjust vertical position

        bubbles.exit().remove();

        bubbles.merge(bubbleEnter)
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }
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


async function drawEvolutionChain(chain) {
    evolutionChart.selectAll("*").remove();

    const width = 1200, height = 400; // Increased size for more space
    const svg = evolutionChart.append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const nodes = [];
    const links = [];

    async function buildChain(node, parent = null, depth = 0) {
        const pokemonId = getPokemonId(node.species.url);
        const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(res => res.json());

        nodes.push({ 
            name: node.species.name, 
            id: pokemonId,
            stats: pokemonData.stats,
            depth: depth
        });

        if (parent) {
            links.push({ source: parent, target: node.species.name });
        }

        for (const e of node.evolves_to) {
            await buildChain(e, node.species.name, depth + 1);
        }
    }

    await buildChain(chain);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.name).distance(200))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("x", d3.forceX((d, i) => 100 + i * 150).strength(1))
        .force("y", d3.forceY(height / 2).strength(1));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowhead)");

    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -200 200 200")
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
        .attr("r", 40)
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10]) // Different colors for personality
        .attr("stroke", "#666")
        .attr("stroke-width", 2)
        .on("mouseover", function() {
            d3.select(this).transition()
                .duration(300)
                .attr("r", 45)
                .attr("fill", "#ffcb05");
        })
        .on("mouseout", function() {
            d3.select(this).transition()
                .duration(300)
                .attr("r", 40)
                .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);
        });

    node.append("image")
        .attr("xlink:href", d => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.id}.png`)
        .attr("x", -30)
        .attr("y", -30)
        .attr("width", 60)
        .attr("height", 60);

    node.append("text")
        .attr("dy", 50)
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", "#333");

        node.on("mouseover", function(event, d) {
            tooltip.style("display", "block")
              .html(`
                <div class="tooltip-content">
                  <div class="pokemon-info">
                    <div class="pokemon-name" style="font-weight: 700; font-size: 18px;">${d.name}</div>
                    <div class="pokemon-image">
                      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.id}.png" alt="${d.name}" width="96">
                    </div>
                    <div class="pokemon-id" style="font-size: 16px;">ID: ${d.id}</div>
                  </div>
                  <div class="pokemon-stats" style="margin-top: 12px;">
                    <div class="stats-label" style="color: #27ae60; font-weight: 600; font-size: 16px;">Stats:</div>
                    <div class="stats-list" style="font-size: 15px; line-height: 1.5; margin-top: 8px;">
                      HP: ${d.stats[0].base_stat} <br>
                      Attack: ${d.stats[1].base_stat} <br>
                      Defense: ${d.stats[2].base_stat} <br>
                      Sp. Atk: ${d.stats[3].base_stat} <br>
                      Sp. Def: ${d.stats[4].base_stat} <br>
                      Speed: ${d.stats[5].base_stat}
                    </div>
                  </div>
                </div>
              `);
          })
    .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        tooltip.style("display", "none");
    })
    .on("click", (event, d) => {
        node.select("circle")
            .attr("fill", n => n === d || links.some(l => (l.source === d && l.target === n) || (l.target === d && l.source === n)) ? "#ffcb05" : (d, i) => d3.schemeCategory10[i % 10]);
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

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show'); 
            }
        }
    }
}