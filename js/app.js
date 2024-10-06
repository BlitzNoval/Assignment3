const typeChart = d3.select("#typeChart");
const evolutionChart = d3.select("#evolutionChart");

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

    for (const pokemon of pokemons) {
        const details = await fetch(pokemon.url);
        const data = await details.json();
        data.types.forEach(type => {
            const typeName = type.type.name;
            typeCount[typeName] = (typeCount[typeName] || 0) + 1;
            if (!typeDetails[typeName]) {
                typeDetails[typeName] = {
                    count: 0,
                    pokemons: []
                };
            }
            typeDetails[typeName].count++;
            typeDetails[typeName].pokemons.push({
                name: data.name,
                sprite: data.sprites.front_default
            });
        });
    }

    drawTypeDistributionChart(typeCount, typeDetails);
}

// Draw type distribution bubbles
function drawTypeDistributionChart(typeCount, typeDetails) {
    typeChart.selectAll("*").remove(); // Clear previous chart

    const width = +typeChart.attr("width");
    const height = +typeChart.attr("height");

    const nodes = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

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
        const bubbles = typeChart.selectAll("g")
            .data(nodes);

        const bubbleEnter = bubbles.enter().append("g");

        bubbleEnter.append("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => color(d.type))
            .on("mouseover", (event, d) => {
                const details = typeDetails[d.type];
                const samplePokemons = details.pokemons.slice(0, 5);
                let pokemonList = samplePokemons.map(p => `
                    <div style="display: inline-block; text-align: center; margin: 5px;">
                        <img src="${p.sprite}" alt="${p.name}" width="40"><br>
                        <span style="font-size: 12px;">${p.name}</span>
                    </div>
                `).join('');

                tooltip.style("display", "block")
                    .html(`
                        <strong style="font-size: 16px; color: ${color(d.type)};">${d.type.toUpperCase()}</strong><br>
                        <span style="font-size: 14px;">Count: ${d.count}</span><br><br>
                        <strong>Includes:</strong><br>
                        ${pokemonList}<br>
                        <span style="font-size: 12px; color: #666;">(and ${details.count - 5} more...)</span>
                    `);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            })
            .on("click", (event, d) => {
                // Toggle selection
                const isSelected = d3.select(event.currentTarget).classed("selected");
                d3.select(event.currentTarget).classed("selected", !isSelected);

                if (!isSelected) {
                    // Grow and change color when selected
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(300)
                        .attr("r", radiusScale(d.count) * 1.2)
                        .attr("fill", d3.color(color(d.type)).brighter(0.5));
                } else {
                    // Return to original size and color when deselected
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(300)
                        .attr("r", radiusScale(d.count))
                        .attr("fill", color(d.type));
                }
            });

        bubbleEnter.append("text")
            .attr("dy", "-1em")
            .attr("text-anchor", "middle")
            .text(d => d.type)
            .style("font-size", "12px")
            .style("fill", "#333");

        bubbles.exit().remove();

        bubbles.merge(bubbleEnter)
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    // Add CSS for hover effect
    d3.select("head").append("style").text(`
        circle:hover {
            stroke: #333;
            stroke-width: 2px;
            cursor: pointer;
        }
    `);
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
    evolutionChart.selectAll("*").remove(); // Clear previous chart

    const width = 800, height = 200;
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
        .force("link", d3.forceLink(links).id(d => d.name).distance(150))
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
        .enter().append("g");

    node.append("circle")
        .attr("r", 25)
        .attr("fill", "#69b3a2")
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block")
                .html(`
                    <strong>${d.name.toUpperCase()}</strong><br>
                    HP: ${d.stats[0].base_stat}<br>
                    Attack: ${d.stats[1].base_stat}<br>
                    Defense: ${d.stats[2].base_stat}<br>
                    Special Attack: ${d.stats[3].base_stat}<br>
                    Special Defense: ${d.stats[4].base_stat}<br>
                    Speed: ${d.stats[5].base_stat}<br>
                `);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });

    node.append("text")
        .attr("dy", 40)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d.name);

    simulation.nodes(nodes).on("tick", () => {
        node.attr("transform", d => `translate(${d.x},${d.y})`);
        link.attr("d", d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
    });

    simulation.force("link").links(links);

    function getPokemonId(url) {
        return url.split("/").filter(Boolean).pop();
    }
}



// Initiate the type distribution and evolution chain fetch on load
fetchTypeDistribution();
