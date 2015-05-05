IncomeVis = function(_parentElement, _county_income, _eventHandler){
	this.parentElement = _parentElement;
	this.county_income = _county_income;
	this.eventHandler = _eventHandler;
	this.displayData = [];
  this.percentagedata = [];
  this.total;
	this.age_domain = ["$1 to 9,999", "$10,000 to 24,999", "$25,000 to 49,999", "$50,000 to 74,999", "$75,000 to 99,999", "$100,000 to 199,999", "$200,000 or more"]
	this.initVis();
}

IncomeVis.prototype.initVis = function(){
    var that = this; 

    // selects svg, sets parameters
    this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;

     
    this.svg = this.svg.append("g") 
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width - 50], .1)
      .domain(d3.range(0, that.age_domain.length));

    this.y = d3.scale.linear()
      .range([this.height - 150, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(6)
      .orient("left");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height - 150) + ")")
        .call(this.xAxis)
        .selectAll("text")
          .attr("y", 5)
          .attr("x", 10)
          .attr("transform", "rotate(45)")
          .attr("text-anchor",  "start")
          .style("text-anchor", "start")
          .text(function(d,i) { return that.age_domain[i]})
          .attr("font-size", 8);

    this.svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")

}

IncomeVis.prototype.updateVis = function(){
	var that = this;

  var arr = d3.map(this.displayData).values();
  this.total = d3.sum(arr);
  this.datawrangle(arr);

    // calls y Axis
    this.svg.select(".y.axis")
        .call(this.yAxis)

    this.y.domain([0, 100]);


     // Data join
    //var bar_g = this.svg.append("g");
    var bar = this.svg.selectAll(".bar")
      .data(this.percentagedata);

    // removes unneeded bars
    bar.exit()
      .remove();

    // Append new bar groups, if required
    bar.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i){
          return  that.x(i);
        })
       .attr("width", (that.width/15));

    // adds bar features
    bar.attr("y", function(d) {
            return (that.y(d));
        })
       .attr("height", function(d){return that.height - 150 - that.y(d);})
       .attr("fill", "yellow");

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-20, 0])
      .html(function(d) {
        return "<style='color:white'> # of residents: " + parseInt(d* that.total) + "</style>";
      })

    this.svg.call(tip);

    bar.on("mouseover", tip.show)


}

IncomeVis.prototype.onSelectionChange = function(d){
	var that = this;

	var county = d.properties.county.toLowerCase();
	this.displayData = that.county_income[county];
	this.updateVis();
}

IncomeVis.prototype.datawrangle = function(d){
  var that = this;
  for (i=0; i< d.length; i++)
  {
    that.percentagedata.push(d[i]/that.total*100);
  }
  //console.log(this.percentagedata);

}