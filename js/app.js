// Authorization Bearer Token (use your Spotify access token here)
const accessToken = 'YOUR_SPOTIFY_ACCESS_TOKEN';

const fetchSpotifyData = async () => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
    }
};

const createCircleChart = (tracks) => {
    const svg = d3.select('#circle-chart');
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const radiusScale = d3.scaleSqrt().domain([0, 100]).range([5, 50]);

    svg.selectAll('circle')
        .data(tracks)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => (i + 1) * (width / (tracks.length + 1)))
        .attr('cy', height / 2)
        .attr('r', d => radiusScale(d.popularity))
        .attr('fill', 'steelblue')
        .append('title')
        .text(d => `${d.name}: Popularity ${d.popularity}`);
};

const createBarChart = (tracks) => {
    const svg = d3.select('#bar-chart');
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    const x = d3.scaleBand()
        .domain(tracks.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(tracks, d => d.duration_ms)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append('g')
        .selectAll('.bar')
        .data(tracks)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.duration_ms))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.duration_ms));

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .text('Track Name');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text('Track Duration (ms)');
};

const initVisualizations = async () => {
    const tracks = await fetchSpotifyData();
    createCircleChart(tracks);
    createBarChart(tracks);
};

initVisualizations();
