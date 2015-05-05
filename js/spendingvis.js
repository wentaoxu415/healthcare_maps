SpendingVis = function(_parentElement, _spendingData, _eventHandler){
  this.parentElement = _parentElement;
  this.spendingData = _spendingData;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.initVis();
}

SpendingVis.prototype.initVis = function(){
    var that = this; 

    // selects svg, sets parameters
    this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;

    for (var key in this.spendingData){
    	if (this.spendingData[key]){
    		this.displayData.push(this.spendingData[key])
    	}
    }
    
    this.svg = this.svg
    	.append("g") 
    	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.x = d3.scale.linear()
      .domain([0, 50000])
      .range([0, this.width]);

    

    var hist = d3.layout.histogram()
    	.bins(this.x.ticks(20))
    	(this.displayData);

    this.y = d3.scale.linear()
    	.domain([0, 1000])
      	.range([this.height-50, 0]);
		
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    // this.yAxis = d3.svg.axis()
    //   .scale(this.y)
    //   .ticks(6)
    //   .orient("left");

    // //Add bars

    this.bar = this.svg.selectAll(".bar")
    	.data(hist)
    	.enter().append("g")
    	.attr("class", "bar")
    	.attr("transform", function(d) { return "translate(" + that.x(d.x) + "," + that.y(d.y) + ")"; });

    this.bar.append("rect")
    	.attr("x", 1)
    	.attr("width", this.x(hist[1].dx)-1)
    	.attr("height", function(d){ return that.height - 50 - that.y(d.y)});

    
    var formatCount = d3.format(",.0f");

    this.bar.append("text")
    	.attr("dy", ".75em")
    	.attr("y", -20)
    	.attr("x", this.x(hist[0].dx) / 2)
    	.attr("text-anchor", "middle")
    	.text(function(d) { return formatCount(d.y); })
    	.style("color", "#FFF");
    // // Add axes visual elements
    // this.svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + (this.height - 150) + ")")
    //     .call(this.xAxis)
    //     // .selectAll("text")
    //     //   .attr("y", 5)
    //     //   .attr("x", 10)
    //     //   .attr("transform", "rotate(45)")
    //     //   .attr("text-anchor",  "start")
    //     //   .style("text-anchor", "start")
    //     //   .text(function(d,i) { return that.age_domain[i]})
    //     //   .attr("font-size", 8);

    // this.svg.append("g")
    //     .attr("class", "y axis")
    //     .append("text")
    //     .attr("transform", "rotate(-90)")
}

SpendingVis.prototype.onSelectionChange = function(d){
	var that = this;
	console.log(d);	
}

