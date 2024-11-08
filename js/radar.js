async function createEnhancedStatsChart() {
    const svg = d3.select("#statsChart"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = { top: 20, right: 150, bottom: 70, left: 50 };
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().range([0, chartWidth]);
    const yScale = d3.scaleLinear().range([chartHeight, 0]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Axes
    g.append("g").attr("class", "x-axis").attr("transform", `translate(0,${chartHeight})`);
    g.append("g").attr("class", "y-axis");

    // Fetch Pokémon data
    const data = [];
    for (let i = 1; i <= 100; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const pokemon = await response.json();
        data.push({
            name: pokemon.name,
            speed: pokemon.stats[5].base_stat,
            attack: pokemon.stats[1].base_stat,
            type: pokemon.types[0].type.name
        });
    }

    // Set domain for scales
    xScale.domain(d3.extent(data, d => d.speed)).nice();
    yScale.domain(d3.extent(data, d => d.attack)).nice();

    // Axes Labels
    g.select(".x-axis")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", 35)
        .attr("fill", "black")
        .text("Speed");

    g.select(".y-axis")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", -chartHeight / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .text("Attack");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Plot points with entrance animation
    const circles = g.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.speed))
        .attr("cy", d => yScale(d.attack))
        .attr("r", 0)  // Start with radius 0 for animation
        .attr("fill", d => colorScale(d.type))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Name: ${d.name}<br>Type: ${d.type}<br>Speed: ${d.speed}<br>Attack: ${d.attack}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(event.target)
                .transition().duration(200)
                .attr("r", 10);
        })
        .on("mouseout", (event) => {
            tooltip.transition().duration(500).style("opacity", 0);
            d3.select(event.target)
                .transition().duration(200)
                .attr("r", 6);
        });

    // Animate points popping in
    circles.transition()
        .duration(800)
        .attr("r", 6)
        .delay((d, i) => i * 10);

    // Move legend to the top right
    const types = Array.from(new Set(data.map(d => d.type)));
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 70}, 20)`);

    types.forEach((type, i) => {
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", i * 20)
            .attr("r", 6)
            .attr("fill", colorScale(type))
            .style("cursor", "pointer")
            .on("click", () => {
                circles.transition()
                    .duration(500)
                    .attr("opacity", d => d.type === type ? 1 : 0.1);
            });

        legend.append("text")
            .attr("x", 15)
            .attr("y", i * 20 + 5)
            .text(type)
            .style("cursor", "pointer")
            .on("click", () => {
                circles.transition()
                    .duration(500)
                    .attr("opacity", d => d.type === type ? 1 : 0.1);
            });
    });

    // Range slider for Speed
    d3.select("#speedSlider").on("input", function() {
        const speedLimit = +this.value;
        d3.select("#speedLabel").text(speedLimit);
        circles.transition()
            .duration(500)
            .attr("opacity", d => d.speed <= speedLimit ? 1 : 0.1);
    });

    // Reset opacity on double-click
    svg.on("dblclick", () => {
        circles.transition()
            .duration(500)
            .attr("opacity", 1);
    });
}

createEnhancedStatsChart();
