
// Define the dimensions and margins for the map
const width = 870;
const height = 600;

// Create an SVG element and append it to the #choropleth-map div
const svg = d3.select("#choropleth-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator for the map
const projection = d3.geoMercator()
    .center([20, 50])
    .scale(600)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Define a color scale for the NEET rates
const color = d3.scaleSequential(d3.interpolateOranges)
    .domain([5, 35]); 

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

// Create a container for the map elements that will be zoomable
const g = svg.append("g");

// Add the zoom behavior to the SVG
svg.call(zoom);

// Load the GeoJSON data for Europe
d3.json("europ.geojson").then(function(geojson) {

    // Load the NEET rates data
    d3.csv("clean_data/choropleth_data.csv").then(function(data) {

        // Create a map from country name to NEET rate
        const rateById = {};
        data.forEach(d => {
            rateById[d.country] = +d.NEET_Rate;
        });

        // Bind the NEET rates data to the GeoJSON features
        geojson.features.forEach(d => {
            d.properties.rate = rateById[d.properties.name] || 0;
        });

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                if (d.properties.rate === 0) {
                    return "#ccc"; 
                }
                return color(d.properties.rate);
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("stroke-width", 2);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>Country:</strong> ${d.properties.name}<br>
                              <strong>NEET Rate:</strong> ${d.properties.rate === 0 ? 'Data Not Available' : d.properties.rate + '%'}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 5) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke-width", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add a tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px");

        // Add a horizontal legend
        const legendWidth = 300;
        const legendHeight = 10;

        const legend = svg.append("g")
            .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 40})`);

        const legendScale = d3.scaleLinear()
            .domain(color.domain())
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(6);

        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        gradient.selectAll("stop")
            .data(color.ticks().map((t, i, n) => ({
                offset: `${100 * i / n.length}%`,
                color: color(t)
            })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#gradient)");

        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);

        legend.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .text("NEET Rate");
    });

});

// Define the zoomed function
function zoomed(event) {
    g.attr("transform", event.transform);
}
