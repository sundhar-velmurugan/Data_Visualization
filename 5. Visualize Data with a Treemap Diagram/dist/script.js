Promise.resolve(d3.json('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json')).then(response => constructMap(response));

const constructMap = data => {
  let height = 800;
  let width = 1200;
  let padding = { outer: 2, inner: 1 };

  let COLORS = ['#bf97c2', '#17d95a', '#8e13f4', '#01ac5b', '#07ad23', '#6b9fd9', '#d1d439', '#767d3b', '#90fbc8', '#ecc118', '#65dd3b', '#a629cf', '#f315a6', '#7871e5', '#b9dd9a', '#dbab5f', '#f9b8ed', '#427b6c'];

  let tooltip = d3.select('body').
  append('div').
  attr('id', 'tooltip').
  style('opacity', 0);

  let root = d3.hierarchy(data);
  root.sum(d => d.value); // traverses the tree and sets 'value' on each node to the sum of its children

  let treemapLayout = d3.treemap();
  treemapLayout.size([width, height]).
  paddingOuter(padding.outer).
  paddingInner(padding.inner);

  // passing the hierarchy object to the treemap
  // The layout adds 4 properties x0, x1, y0 and y1 to each node which specify the dimensions of each rectangle in the treemap.
  treemapLayout(root);

  let legendDomain = root.children.map(d => d.data.name);

  d3.select('body').
  append('p').
  attr('id', 'title').
  text('Video Game Sales').
  style('font-size', '34px');

  d3.select('body').
  append('p').
  attr('id', 'description').
  html('Top 100 Most Sold Video Games Grouped by Platform').
  style('font-size', '26px');

  let svgHeight = height + 200;

  let svg = d3.select('body').
  append('svg').
  attr('height', svgHeight).
  attr('width', width);

  let tiles = svg.selectAll('g').
  data(root.leaves()).
  enter().
  append('g').
  attr('transform', d => 'translate(' + [d.x0, d.y0] + ')');

  tiles.append('rect').
  attr('width', d => d.x1 - d.x0).
  attr('height', d => d.y1 - d.y0).
  attr('class', 'tile').
  attr('fill', d => COLORS[legendDomain.indexOf(d.parent.data.name)]).
  attr('data-name', d => d.data.name).
  attr('data-value', d => d.data.value).
  attr('data-category', d => d.data.category).
  on('mouseover', d => {
    tooltip.style('opacity', 0.9);
    tooltip.
    html(() => {
      return `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`;
    }).
    attr('data-value', d.data.value).
    style('left', d3.event.pageX + 10 + 'px').
    style('top', d3.event.pageY - 30 + 'px');
  }).
  on('mouseout', () => {
    tooltip.style('opacity', 0);
  });

  tiles.append('text').
  selectAll('tspan').
  data(d => d.data.name.match(/(.{1,12})/g)).
  enter().
  append('tspan').
  attr('x', 4).
  attr('y', (d, i) => 14 + i * 10).
  text((d, i) => i ? `-${d}` : d);

  let legend = svg.selectAll('.legend').
  data(legendDomain).
  enter().
  append('g').
  attr('id', 'legend');
  let legendWidth = [];
  let legendHeight = [];
  for (let i = 0; i < 5; i++) {
    legendWidth.push(width / 10 * (i % 5) + width / 3);
  }
  for (let i = 0; i < 4; i++) {
    legendHeight.push(i % 4 * 20 + height);
  }
  let rowNumber = 0;
  let legendPosition = {};
  for (let i = 0, len = legendDomain.length; i < len; i++) {
    legendPosition[legendDomain[i]] = [legendHeight[rowNumber], legendWidth[i % 5]];
    if (i % 5 === 4) rowNumber++;
  }

  legend.append('rect').
  attr('x', (d, i) => legendPosition[d][1]).
  attr('y', (d, i) => legendPosition[d][0]).
  attr('width', 18).
  attr('height', 18).
  attr('class', 'legend-item').
  style('fill', d => COLORS[legendDomain.indexOf(d)]);

  legend.append('text').
  attr('x', (d, i) => legendPosition[d][1] + 25).
  attr('y', (d, i) => legendPosition[d][0] + 9).
  attr('dy', '0.35em').
  text(d => d);

};