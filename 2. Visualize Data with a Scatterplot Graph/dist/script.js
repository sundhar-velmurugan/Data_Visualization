const parseTime = d3.timeParse("%M:%S");
const formatTime = d3.timeFormat("%M:%S");

const color = d3.scaleOrdinal(d3.schemeSet1);

const plotGraph = responseText => {
  let data = JSON.parse(responseText);
  let svgHeight = 550;
  let svgWidth = 1000;
  let padding = {
    top: 20,
    bottom: 63,
    left: 40,
    right: 15 };

  let chartHeight = svgHeight - padding.top - padding.bottom;
  let chartWidth = svgWidth - padding.left - padding.right;

  let svg = d3.select('body').
  append('svg').
  attr('height', svgHeight).
  attr('width', svgWidth).
  style('background-color', 'LavenderBlush');

  let xScale = d3.scaleLinear().
  domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1]).
  range([padding.left, svgWidth - padding.right]);

  let xAxis = d3.axisBottom().
  scale(xScale).
  tickFormat(d3.format("d"));

  svg.append('g').
  attr('id', 'x-axis').
  attr('transform', 'translate(0, ' + (svgHeight - padding.top) + ')').
  call(xAxis);

  let yScale = d3.scaleTime().
  domain(d3.extent(data, d => parseTime(d.Time))).
  range([padding.bottom, svgHeight - padding.top]);

  let yAxis = d3.axisLeft().
  scale(yScale).
  tickFormat(d => formatTime(d));

  svg.append('g').
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding.left + ', 0)').
  call(yAxis);

  svg.append('text').
  attr('id', 'title').
  attr('x', svgWidth * (1 / 3)).
  attr('y', padding.bottom * (2 / 7)).
  html('Doping in Professional Bicycle Racing');
  svg.append('text').
  attr('x', svgWidth * (3 / 7)).
  attr('y', padding.bottom * (4 / 7)).
  html('35 Fastest times up Alpe d\'Huez');

  let tooltip = svg.append('text').
  attr('id', 'tooltip').
  style('font-weight', '600');

  svg.selectAll('circle').
  data(data).
  enter().
  append('circle').
  attr('cx', d => xScale(d.Year)).
  attr('cy', d => yScale(parseTime(d.Time))).
  attr('r', 5).
  attr('class', 'dot').
  attr('data-xvalue', d => d.Year).
  attr('data-yvalue', d => parseTime(d.Time).toISOString()).
  attr('fill', d => color(d.Doping !== '')).
  attr('opacity', 0.6).
  on('mouseover', d => {
    tooltip.attr('data-year', d.Year).
    attr('x', xScale(d.Year) + 5).
    attr('y', yScale(parseTime(d.Time)) + 5).
    text(d.Name + ', ' + d.Time + ' - ' + d.Year + (d.Doping ? ' : ' + d.Doping : ''));
  });

  svg.on('mouseout', () => {
    tooltip.attr('opacity', 0);
  });
  svg.on('mouseover', () => {
    tooltip.attr('opacity', '100');
  });

  let legend = svg.selectAll(".legend").
  data(color.domain()).
  enter().append("g").
  attr("id", "legend").
  attr("transform", (d, i) => {
    return "translate(0," + (svgHeight * (1 / 5) - i * 20) + ")";
  });

  legend.append("rect").
  attr("x", svgWidth - padding.right).
  attr("width", 18).
  attr("height", 18).
  style("fill", color);

  legend.append("text").
  attr("x", svgWidth - padding.right - 3).
  attr("y", 9).
  attr("dy", ".35em").
  style("text-anchor", "end").
  text(d => {
    if (d) return "Riders with doping allegations";else
    {
      return "No doping allegations";
    };
  });

};

let req = new XMLHttpRequest();
req.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
req.send();
req.onload = () => {
  if (req.readyState === 4 && req.status === 200) {
    plotGraph(req.responseText);
  }
};