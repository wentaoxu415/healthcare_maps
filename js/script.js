
var width = 960,
    height = 500,
    active = d3.select(null);



var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var map = svg.append("g");


var tooltip = {
    element: null,
    init: function() {
        this.element = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    },
    show: function(t) {
        this.element.html(t).transition().duration(200).style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", 0.8);
    },
    move: function() {
        this.element.transition().duration(30).ease("linear").style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", 0.8);
    },
    hide: function() {
        this.element.transition().duration(500).style("opacity", 0)
    }};

tooltip.init();

var numFormat = d3.format(",d");


svg
    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);


var countyData;
var allData;


queue()
    .defer(d3.json, "map/us.json")
    .defer(d3.csv, "data/population.csv")//, function(d) {  rateById.set(d["GEO.id2"], +d["HD01_VD01"]); })
    .defer(d3.csv, "data/allData.csv")
    .await(ready);

function ready (error, us, popStates, allPop) {



  allData = allPop;
  countyData = topojson.feature(us, us.objects.counties).features;

  var popStatesExtent = d3.extent(popStates, function(d) { return +d["HD01_VD01"]; });

  var rateById = {};
  var nameById = {};

  popStates.forEach(function(d) { rateById[d.id] = +d["HD01_VD01"]; nameById[d.id] = d["GEO.display-label"];});  


  var colorScale = d3.scale.linear()
      .domain(popStatesExtent) 
      .range(["rgb(255, 255, 178)", "rgb(31, 178, 36)"]);

  var states = map.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    //.data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d, i) {  return colorScale(rateById[d.id]); })
      .attr("class", "feature")
      .on("click", clicked);

  states.on("mouseover", function (d, i) {

      tooltip.show("<b>" + nameById[d.id]  + "</b>" + "<br>" + "Population: " + numFormat(rateById[d.id]));    
      //toGreyExcept(this);
  });


  states.on("mousemove", function (d, i) {   
      tooltip.move();
      })
      .on("mouseout", function (d, i) {
      //createStuff();
      tooltip.hide();
  });       

  map.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

      

};

function clicked(d) {
  tooltip.hide();
  d3.selectAll(".feature").style("opacity", 0.3);

  d3.selectAll(".counties").remove();
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);


  var filteredData = allData.filter(function (e) {return +e.stateId === +d.id});

  filteredData.shift();

  filteredData.forEach(function (e) {e.id = d.id * 1000 + (+e.countyId)})


  var filteredDataExtent = d3.extent(filteredData, function(d) { return +d.population; });



  var rateById = {};
  var nameById = {};

  filteredData.forEach(function(d) { rateById[d.id] = +d.population; nameById[d.id] = d.name;});    

  //filteredData.forEach(function(d) { rateById[d.id] = +d.population; });  

  var colorScale = d3.scale.linear()
      .domain(filteredDataExtent) 
      .range(["rgb(255, 255, 178)", "rgb(31, 178, 36)"]);  


  var counties = map.selectAll(".counties")
    .data(countyData.filter(function (e) {return e.id > d.id * 1000 && e.id < d.id * 1000 + 1000}))
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d, i) {  return colorScale(rateById[d.id]); })
      .attr("class", "counties")
      .on("click", function (d) {
        reset();
      });

  counties.on("mouseover", function (d, i) {

      tooltip.show("<b>" + nameById[d.id]  + "</b>" + "<br>" + "Population: " + numFormat(rateById[d.id]));    
      //toGreyExcept(this);
  });


  counties.on("mousemove", function (d, i) {   
      tooltip.move();
      })
      .on("mouseout", function (d, i) {
      //createStuff();
      tooltip.hide();
  }); 



}

function reset() {
  tooltip.hide();
  d3.selectAll(".feature").style("opacity", 1);
  d3.selectAll(".counties").remove();
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  map.style("stroke-width", 1.5 / d3.event.scale + "px");
  map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}