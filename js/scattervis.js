ScatterVis = function(_parentElement, _scatterData, _eventHandler){
  this.parentElement = _parentElement;
  this.scatterData = _scatterData;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.initVis();
  
}

ScatterVis.prototype.initVis = function(){
	var that = this;
	this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;

    
    for (var key in this.scatterData){
    	if (this.scatterData[key]){
    		this.displayData.push(this.scatterData[key])
    	}
    }
    console.log(this.displayData);
    this.x = d3.scale.linear()
    	.domain(d3.extent(this.displayData, function(d) { return d["spending"]; })).nice()
    	.range([0, this.width]);

    this.y = d3.scale.linear()
    	.domain(d3.extent(this.displayData, function(d) { return d["quality"]; })).nice()
    	.range([this.height, 0]);

    this.xAxis = d3.svg.axis()
    	.scale(this.x)
    	.orient("bottom");

    this.yAxis = d3.svg.axis()
    	.scale(this.y)
    	.orient("left");

    this.svg = this.svg.append("g") 
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("g")
		.attr("class", "x axis")
      	.attr("transform", "translate(0," + this.height + ")")
      	.call(this.xAxis)
		.append("text")
      	.attr("class", "label")
      	.attr("x", this.width)
      	.attr("y", -6)
      	.style("text-anchor", "end")
      	.text("Hospital Spending ($)");

  	this.svg.append("g")
    	.attr("class", "y axis")
      	.call(this.yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Hospital Quality")

	this.svg.selectAll(".dot")
		.data(this.displayData)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 2.5)
		.attr("cx", function(d){return that.x(d["spending"])})
		.attr("cy", function(d){return that.y(d["quality"])})

}

// ScatterVis.prototype.onSelectionChange = function(d){
// 	console.log(d)
// }