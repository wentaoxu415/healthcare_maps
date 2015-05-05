QualityVis = function(_parentElement, _qualityData, _eventHandler){
  this.parentElement = _parentElement;
  this.qualityData = _qualityData;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.quality;
  this.histarray;
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

    this.y = d3.scale.linear()
        .domain([0, 1000])
        .range([this.height-50, 0]);
        
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
       .scale(this.y)
       .ticks(6)
       .orient("left");

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height - 50) + ")")
        .call(this.xAxis)
        .selectAll("text")
          .attr("y", 5)
          .attr("x", 10)
          .attr("transform", "rotate(45)")
          //.attr("text-anchor",  "start")
          //.style("text-anchor", "start")
          .text(function(d,i) { return d})
          .attr("font-size", 12);

    this.svg.append("g")
         .attr("class", "y axis")
         .append("text")
         .attr("transform", "rotate(-90)");

    this.updateVis();

}

QualityVis.prototype.updateVis = function(){
        // //Add bars
    var that = this;
    var hist = d3.layout.histogram()
        .bins(this.x.ticks(50))
        (this.displayData);

    this.histarray = null; 
    this.comparevalues(hist);

    this.svg.selectAll(".bar1").remove();

    var bar = this.svg.selectAll(".bar1")
        .data(hist)


    bar.enter().append("g")
        .attr("class", "bar1")
        .attr("transform", function(d) { return "translate(" + that.x(d.x) + "," + that.y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", (that.width-50)/50-4)
        .attr("height", function(d){ return that.height - 50 - that.y(d.y)})
        .attr("fill", function(d, i) {if (that.histarray == i){return "red"} else return "steelblue"}) 

    
    var formatCount = d3.format(",.0f");

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -12)
        // .attr("x", this.x(hist[0].dx) / 2)
        .attr("x", 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#000000")
        .attr("font-size", 8)
        .text(function(d) { return formatCount(d.y); })
}

QualityVis.prototype.comparevalues = function(d){
    var that = this;
    for (i = 0; i < d.length; i++)
    {
        for(e= 0; e< d[i].length; e++)
        {
            if (d[i][e] == that.quality || d[i][e] < that.quality && d[i][e+1] > that.quality)
            {
                that.histarray = i;
            }
        }
    }
}

QualityVis.prototype.onSelectionChange = function(d){
    var that = this;
    var hospital = d.properties.name;
    this.quality = this.qualityData[hospital];
    this.updateVis();
}

