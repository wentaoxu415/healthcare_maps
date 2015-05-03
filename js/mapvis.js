MapVis = function(_parentElement, _mapData, _hosData, _eventHandler){
	this.parentElement = _parentElement;
	this.mapData = _mapData;
	this.hosData = _hosData;
	this.eventHandler = _eventHandler;
	this.displayData = [];
	this.initVis();
}

MapVis.prototype.initVis = function(){
	var that = this;

	this.centered = null;

	this.svg = this.parentElement.selectAll("svg");
	this.margin = {top:20, right:20, bottom:20, left:20};
	this.width = this.svg.attr("width")-this.margin.left - this.margin.right;
	this.height = this.attr("height")-this.margin.top - this.margin.bottom;

	this.svg = this.svg.append("g")
		.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("rect")
    	.attr("class", "background")
    	.attr("width", this.width)
    	.attr("height", this.height)

	this.projection = d3.geo.albersUsa()
    	.translate([this.width / 2, this.height / 2]);

    this.path = d3.geo.path()
    	.pointRadius([0.5])
    	.projection(this.projection)

    var zoom = d3.behavior.zoom()
    	.translate(projection.translate())
    	.scale(projection.scale())
    	.scaleExtent([height, 8 * height])
    	.on("zoom", zoomed);
	
	this.g = this.svg.append("g")
    	.call(zoom);
}

MapVis.prototype.updateVis = function(){
	this.g.append("g")
		.attr("id", "states")
      	.selectAll("path")
        .data(topojson.feature(this.mapData, this.mapData.objects.states).features)
      	.enter().append("path")
        .attr("d", path)
        .on("click", clicked);

 	this.g.append("path")
    	.datum(topojson.mesh(this.mapData, this.mapData.objects.states, function(a, b) { return a !== b; }))
    	.attr("id", "state-borders")
    	.attr("d", path);

	this.g.append("g")
		.attr("id", "hospitals")
		.selectAll("path")
		.data(this.hosData.features)
		.enter().append("path")
		.attr("d", path)
		.on("click", display)  
}

MapVis.prototype.clicked = function(d){
	var x, y, k;
	if (d && centered !== d){
		var centroid = this.path.centroid(d);
		x = centroid[0]
		y = centroid[1]
		k = 4;
		centered = d;
	}
	else{
		x = this.width/2;
		y = this.height/2;
		k = 1;
		centered = null;
	}

	this.g.selectAll("path")
		.classed("active", centered && function(d){ return d === centered;});

	this.g.transition()
		.duration(750)
      	.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      	.style("stroke-width", 1.5 / k + "px");

}

MapVis.prototype.display = function(d){
	console.log(d);
}

MapVis.prototype.zoomed = function(){
	this.projection.translate(d3.event.translate).scale(d3.event.scale);
	g.selectAll("path").attr("d", path);
}


