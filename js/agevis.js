AgeVis = function(_parentElement, _county_age, _state_demo, _eventHandler){
  this.parentElement = _parentElement;
  this.county_age = _county_age;
  this.state_demo = _state_demo;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.displayDataState = [];
  this.age_domain = ["Under 19", "19 to 64", "Over 65"]
  this.initVis();
}

AgeVis.prototype.initVis = function(){
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

AgeVis.prototype.updateVis = function(){
  var that = this;

  // set y scale domain to max value of count aggregate


    // calls y Axis
    this.svg.select(".y.axis")
        .call(this.yAxis)

//temp display data storage
    var tempdata = [];
    tempdata.push(this.displayData["under_19"]);
    tempdata.push(this.displayData["19_64"]);
    tempdata.push(this.displayData["over_65"]);

    var stempdata = [];
    stempdata.push(this.displayDataState["under_18"]);
    stempdata.push(this.displayDataState["19_64"]);
    stempdata.push(this.displayDataState["over_65"]);



    this.y.domain([0, 100]);


     // Data join
    //var bar_g = this.svg.append("g");
    var bar = this.svg.selectAll(".cbar")
      .data(tempdata);

    // removes unneeded bars
    bar.exit()
      .remove();

    // Append new bar groups, if required
    bar.enter()
        .append("rect")
        .attr("class", "cbar")
        .attr("x", function(d,i){
          return  that.x(i);
        })
       .attr("width", (that.width/11));

    // adds bar features
    bar.attr("y", function(d) {
            console.log(that.y(d)); 
            return (that.y(d));
        })
       .attr("height", function(d){return that.height - 150 - that.y(d);})
       .attr("fill", "#FFCC00");


    //STATEBAR
    var sbar = this.svg.selectAll(".sbar")
      .data(stempdata);

    // removes unneeded bars
    sbar.exit()
      .remove();

    // Append new bar groups, if required
    sbar.enter()
        .append("rect")
        .attr("class", "sbar")
        .attr("x", function(d,i){
           console.log("hi"); return  that.x(i) + (that.width/10);
        })
       .attr("width", (that.width/11));

    // adds bar features
    sbar.attr("y", function(d) {
            console.log(that.y(d)); 
            return (that.y(d));
        })
       .attr("height", function(d){return that.height - 150 - that.y(d);})
       .attr("fill", "green");
}

AgeVis.prototype.onSelectionChange = function(d){
  var that = this;
  var county = d.properties.county.toLowerCase()
  this.displayData = that.county_age[county]
  var state = d.properties.state;
  this.displayDataState = that.state_demo[state];
  this.updateVis();
}





