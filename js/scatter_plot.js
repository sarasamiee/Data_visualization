
// Define the dimensions and margins for the scatter plot
const margin = { top: 50, right: 150, bottom: 50, left: 50 };
const width = 850 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create an SVG element
const svg = d3.select("#scatter-plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define scales for the x and y axes
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Define the axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

// Load the data
d3.csv("clean_data/scatterplot_data.csv").then(function(data) {
  

  data.forEach(d => {
    d.NEET_Rate = +d.NEET_Rate;
    d.Education_Expenditure = +d.Education_Expenditure;
    d.Year = +d.Year;
  });

  // Group data by year
  const dataByYear = d3.group(data, d => d.Year);

  // Set the domains of the scales
  x.domain(d3.extent(data, d => d.Education_Expenditure));
  y.domain(d3.extent(data, d => d.NEET_Rate));

  // Add the x-axis to the plot
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

  // Add the x-axis label
  svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .text("Education Expenditure");

  // Add the y-axis to the plot
  svg.append("g")
      .call(yAxis);

  // Add the y-axis label
  svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .style("text-anchor", "middle")
      .text("NEET Rate");

  // Add the data points to the plot, grouped by year
  dataByYear.forEach((yearData, year) => {
    svg.selectAll(`.dot-${year}`)
        .data(yearData)
      .enter().append("circle")
        .attr("class", `dot-${year}`)
        .attr("r", 3.5)
        .attr("cx", d => x(d.Education_Expenditure))
        .attr("cy", d => y(d.NEET_Rate))
        .style("fill", () => d3.schemeCategory10[year % 10])
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 6);
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`Year: ${d.Year}<br>Sex: ${d.Sex}<br>Country: ${d.Country}<br>NEET Rate: ${d.NEET_Rate}%<br>Education Expenditure: ${d.Education_Expenditure}%`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          d3.select(this).attr("r", 3.5);
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
  });

  // Add a legend for the years
  const legend = svg.selectAll(".legend")
      .data([...dataByYear.keys()].sort())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
      .attr("x", width + 10)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => d3.schemeCategory10[d % 10]);

  legend.append("text")
      .attr("x", width + 34)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d);

  // Calculate and add a trend line for each year
  dataByYear.forEach((yearData, year) => {
    const xValues = yearData.map(d => d.Education_Expenditure);
    const yValues = yearData.map(d => d.NEET_Rate);

    const lr = linearRegression(xValues, yValues);

    // Define the line
    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

    // Add the trend line to the plot
    svg.append("path")
        .datum([{ x: d3.min(xValues), y: lr(d3.min(xValues)) }, { x: d3.max(xValues), y: lr(d3.max(xValues)) }])
        .attr("class", `line-${year}`)
        .attr("d", line)
        .style("stroke", d3.schemeCategory10[year % 10])
        .style("stroke-width", 2)
        .style("fill", "none");
  });

  // Function to calculate linear regression
  function linearRegression(x, y) {
    const n = x.length;
    const xMean = d3.mean(x);
    const yMean = d3.mean(y);
    const xyMean = d3.mean(x.map((d, i) => d * y[i]));
    const xSquareMean = d3.mean(x.map(d => d * d));

    const slope = (xMean * yMean - xyMean) / (xMean * xMean - xSquareMean);
    const intercept = yMean - slope * xMean;

    return function(x) {
      return intercept + slope * x;
    };
  }

});

