// Load the cleaned data
d3.csv("../clean_data/stacked_bar_chart.csv").then(function(data) {

    // Set dimensions and margins
    const margin = {top: 20, right: 30, bottom: 90, left: 60};
    const width = 680 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
console.log(data)
    // Create SVG container
    const svg = d3.select("#stacked-bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the data and prepare it for stacking
    const subgroups = data.columns.slice(1, 3); // Females and Males
    const groups = data.map(d => d.Country);

    // Stack the data
    const stackedData = d3.stack()
        .keys(subgroups)
        (data);

    // Set the scales
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#44E2D3", "#BBE244"]); 

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Create a tooltip 
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#9EE997")
        .style("border", "dashed")
        .style("border-color", "#35EA24")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // Show the tooltip on mouseover
    const showTooltip = function(event, d) {
        const subgroupName = d3.select(this.parentNode).datum().key;
        const subgroupValue = d.data[subgroupName];
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Country: ${d.data.Country}<br>${subgroupName}: ${subgroupValue}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    // Hide the tooltip on mouseout
    const hideTooltip = function() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };

    // Draw the bars with animation
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.Country))
        .attr("y", height)  // Start the bars from the bottom
        .attr("height", 0)  // Start with height 0
        .attr("width", x.bandwidth())
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseout", hideTooltip)
        .transition()  // Add transition for animation
        .duration(1000)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]));

    // Add legend
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(subgroups.slice().reverse())
        .join("g")
        .attr("transform", (d, i) => `translate(-50,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

});
