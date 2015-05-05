QualityVis = function(_parentElement, _qualityData, _eventHandler){
  this.parentElement = _parentElement;
  this.qualityData = _qualityData;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.initVis();
}

QualityVis.prototype.initVis = function(){
    var that = this; 

    // selects svg, sets parameters
    this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;

    for (var key in this.qualityData){
        if (this.qualityData[key]){
            this.displayData.push(this.qualityData[key])
        }
    }

    this.svg = this.svg
        .append("g") 
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.x = d3.scale.linear()
      .domain([d3.min(this.displayData, function(d){return d;}), d3.max(this.displayData, function(d){return d;})])
      .range([0, this.width-50]);

    var hist = d3.layout.histogram()
        .bins(this.x.ticks(50))
        (this.displayData);

    console.log(hist[0].dx);
    this.y = d3.scale.linear()
        .domain([0, 1000])
        .range([this.height-50, 0]);
        
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    // //Add bars

    this.bar = this.svg.selectAll(".bar")
        .data(hist)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + that.x(d.x) + "," + that.y(d.y) + ")"; });

    this.bar.append("rect")
        .attr("x", 1)
        .attr("width", (that.width-50)/50-3.5)
        .attr("height", function(d){ return that.height - 50 - that.y(d.y)});

    
    var formatCount = d3.format(",.0f");

    this.bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -20)
        // .attr("x", this.x(hist[0].dx) / 2)
        .attr("x", 5)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); })
        .style("color", "#FFF");

}

QualityVis.prototype.onSelectionChange = function(d){
    var that = this;
}

