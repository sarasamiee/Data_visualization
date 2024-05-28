// Bar Chart
// Set up the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 50, left: 100},
      width = 680 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Append the SVG object to the div called 'bar-chart'
const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("clean_data/barchart_data.csv").then(data => {

    // Add Y axis
    const y = d3.scaleBand()
        .range([0, height])
        .domain(data.map(d => d.Country))
        .padding(0.1);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.NEET_Rate)])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Create the tooltip
    const tooltip = d3.select("#bar-chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "#E9C3D2")
        .style("border", "solid")
        .style("border-color", "#B9A431")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("color", "#900C3F")
        .style("position", "absolute");

    // Tooltip functions
    const mouseover = function(event, d) {
        tooltip.style("opacity", 1);
    }
    const mousemove = function(event, d) {
        tooltip
            .html(`Country: ${d.Country}<br>NEET Rate: ${d.NEET_Rate}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
    }

    // Bars
    svg.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", d => y(d.Country))
        .attr("x", 0)
        .attr("width", d => x(d.NEET_Rate))
        .attr("height", y.bandwidth())
        .attr("fill", "#BBD989")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

//Add x-axis label
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom )
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("NEET Rate");

//Add y-axis label
svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Country");

    // Add vertical grid lines
svg.selectAll("line.vertical-grid")
  .data(x.ticks(5))
  .enter()
  .append("line")
  .attr("class", "vertical-grid")
  .attr("x1", d => x(d))
  .attr("y1",0)
  .attr("x2", d => x(d))
  .attr("y2", height)
  .style("stroke", "#ccc")
  .style("stroke-width", 0.5)
  .style("stroke-dasharray", "3,3");
});


