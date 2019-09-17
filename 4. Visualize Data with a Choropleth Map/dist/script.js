let files = ['https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json', 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'];

Promise.all(files.map(f => d3.json(f))).then(response => {
  let normalizedEduData = {};
  for (let i = 0, len = response[1].length; i < len; i++) {
    normalizedEduData[response[1][i]['fips']] = response[1][i];
  }
  constructMap(response[0], normalizedEduData);
});

function constructMap(mapData, eduData) {

  let path = d3.geoPath();

  let svgHeight = 650;
  let svgWidth = 1000;

  let tooltip = d3.select('body').
  append('div').
  attr('id', 'tooltip').
  style('opacity', 0);

  d3.select('body').
  append('p').
  attr('id', 'title').
  text('United States Educational Attainment').
  style('font-size', '34px');

  d3.select('body').
  append('p').
  attr('id', 'description').
  html('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)').
  style('font-size', '26px');

  let minData = d3.min(d3.values(eduData), d => d.bachelorsOrHigher);
  let maxData = d3.max(d3.values(eduData), d => d.bachelorsOrHigher);
  let step = (maxData - minData) / 10;

  let legendDomain = [minData];
  for (let i = 1; i <= 8; i++) {
    legendDomain.push(Number((minData + i * step).toFixed(1)));
  }
  legendDomain.push(maxData);
  console.log(legendDomain);

  let color = d3.scaleThreshold().
  domain(legendDomain).
  range(['#001969', '#234788', '#3e76a7', '#60a7c4', '#93d8dc', '#ffdab3', '#ffb388', '#fc895e', '#f35c3c', '#e9002c']);

  let svg = d3.select('body').
  append('svg').
  attr('height', svgHeight).
  attr('width', svgWidth).
  style('background-color', 'LavenderBlush');

  svg.append('g').
  selectAll('path').
  data(topojson.feature(mapData, mapData.objects.counties).features).
  enter().
  append('path').
  attr('d', path).
  attr('fill', d => color(eduData[d.id].bachelorsOrHigher)).
  attr('class', 'county').
  attr('data-fips', d => eduData[d.id].fips).
  attr('data-education', d => eduData[d.id].bachelorsOrHigher).
  style('stroke', '#fff').
  style("stroke-width", 0.5).
  style("cursor", "pointer").
  on('mouseover', d => {
    tooltip.style('opacity', 0.9);
    tooltip.
    html(() => {
      let result = eduData[d.id];
      return `${result.area_name}, ${result.state} : ${result.bachelorsOrHigher}%`;
    }).
    attr('data-education', eduData[d.id].bachelorsOrHigher).
    style('left', d3.event.pageX + 10 + 'px').
    style('top', d3.event.pageY - 30 + 'px');
  }).
  on('mouseout', () => {
    tooltip.style('opacity', 0);
  });

  svg.append('text').
  text('Legend').
  attr('x', svgWidth - 15).
  attr('y', svgHeight * (3 / 5) - 10).
  style('text-anchor', 'end').
  style('font-size', '24px').
  style('font-weight', 600);

  let legend = svg.selectAll('.legend').
  data(legendDomain).
  enter().
  append('g').
  attr('id', 'legend').
  attr('transform', (d, i) => {
    return 'translate(0,' + (svgHeight * (3 / 5) + i * 20) + ')';
  });

  legend.append('rect').
  attr('x', svgWidth - 30).
  attr('width', 18).
  attr('height', 18).
  style('fill', color);

  legend.append('text').
  attr('x', svgWidth - 35).
  attr('y', 9).
  attr('dy', '0.35em').
  style('text-anchor', 'end').
  text((d, i) => legendDomain[i - 1] ? `${legendDomain[i - 1]}% - ${d}%` : ` Upto ${d}%`);
}