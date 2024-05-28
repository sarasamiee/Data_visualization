// Set up the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 50, left: 50},
      width = 680 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the SVG object to the div called 'line-chart'
const svg = d3.select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// load the Data
d3.csv("clean_data/linechart_data.csv").then(data2 => {

    // Format the data
    data2.forEach(d => {
        d.Year = d3.timeParse("%Y")(d.Year);
        d.NEET_Rate = +d["NEET_Rate"];
    });
    console.log(data2)

    // Add X axis
    const x = d3.scaleTime()
        .domain(d3.extent(data2, d => d.Year))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data2, d => d.NEET_Rate)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(data2)
        .attr("fill", "none")
        .attr("stroke", "#6DC781")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.NEET_Rate))
        );

    // Add the points
    svg.selectAll("dot")
        .data(data2)
        .enter().append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.NEET_Rate))
        .attr("r", 3)
        .attr("fill", "#69b3a2");

    // Create the tooltip
    const tooltip = d3.select("#line-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "lightsteelblue")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("opacity", 0);

    // Tooltip functions
    const mouseover = function(event, d) {
        tooltip.style("opacity", 1);
    };
    const mousemove = function(event, d) {
        tooltip
            .html(`Year: ${d3.timeFormat("%Y")(d.Year)}<br>NEET_Rate: ${d.NEET_Rate}%`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    };
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
    };

    // Add the points for tooltip
    svg.selectAll("dot")
        .data(data2)
        .enter().append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.NEET_Rate))
        .attr("r", 3)
        .attr("fill", "#69b3a2")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


        // Add Y-axis label

     svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0-(height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#777")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text("NEET Rate");


        // Add the source credit

     svg.append("text")
        .attr("class", "source-credit")
        .attr("x", width - margin.right - 600)
        .attr("y", height + margin.bottom - 3)
        .style("font-size", "9px")
        .style("font-family", "sans-serif")
        .text("Source: Eurostat");

  //  Add vertical grid lines
  svg.selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5)
    .attr("stroke-dasharray", 4);

      // Add horizontal grid lines
  svg.selectAll("yGrid")
    .data(y.ticks((d3.max(data2, d => d.NEET_Rate)  / 10) + 1).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5)
    .attr("stroke-dasharray", 4);


});
