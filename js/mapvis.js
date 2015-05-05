MapVis = function(_parentElement, _mapData, _hosData, _eventHandler){
	this.parentElement = _parentElement;
	this.mapData = _mapData;
	this.hosData = _hosData;
	this.eventHandler = _eventHandler;
	this.displayData = [];
	this.initVis();
}

MapVis.prototype.color_dot = function(d){
	console.log(d.properties.owner)
	if (d.properties.owner == 'Voluntary non-profit - Private'){
		return "blue";
	}
	else if (d.properties.owner == 'Voluntary non-profit - Church'){
		return "blue";
	}
	else if (d.properties.owner == 'Voluntary non-profit - Other'){
		return "blue";
	}
	else if (d.properties.owner == 'Government - Hospital District or Authority') {
		return "blue";
	}
	else if (d.properties.owner == 'Government - Local')
		return "blue";
	else if (d.properties.owner == 'Government - State')
		return "blue";
	else if (d.properties.owner == 'Government Federal') 
		return "blue";
	else if (d.properties.owner =='Government - Federal'){
		return "blue";
	}
	else if(d.properties.owner == 'Proprietary'){
		return "blue";
	}
	else if(d.properties.owner == 'Physician'){
		return "blue";
	}
	else if (d.properties.owner == 'Tribal'){
		return "blue";
	}
		// case 
		// 	return "#FF66CC";
		// case :
		// 	return "#FF6600";
		// case 'Voluntary non-profit - Other':
		// 	return "#800000";
		// case 'Government - Hospital District or Authority':
		// 	return "#00FFCC";
		// case 'Government - Local':
		// 	return "#00FF00";
		// case 'Government - State':
		// 	return "#009900";
		// case 'Government - State':
		// 	return "#003300";
		// case 'Government Federal':
		// 	return "#003300";
		// case 'Proprietary':
		// 	return "#0066FF";
		// case 'Physician':
		// 	return "#0000CC";
		// case 'Tribal':
		// 	return "#666699";

}
MapVis.prototype.displayblue = function(d){
	console.log("hey")
	return "blue";
}
MapVis.prototype.initVis = function(){
	var that = this;

	this.centered = null;

	this.svg = this.parentElement.selectAll("svg");
	this.margin = {top:20, right:20, bottom:20, left:20};
	this.width = this.svg.attr("width")-this.margin.left - this.margin.right;
	this.height = this.svg.attr("height")-this.margin.top - this.margin.bottom;

	this.svg = this.svg.append("g")
		.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("rect")
    	.attr("class", "background")
    	.attr("width", this.width)
    	.attr("height", this.height)

	this.projection = d3.geo.albersUsa()
    	.translate([this.width / 2, this.height / 2]);

    this.path = d3.geo.path()
    	.pointRadius([0.1])
    	.projection(this.projection)
   	

   	var that = this;
    var zoom = d3.behavior.zoom()
    	.translate(this.projection.translate())
    	.scale(this.projection.scale())
    	.scaleExtent([this.height, 8 * this.height])
    	.on("zoom", function(){that.zoomed(that)});
	
	this.g = this.svg.append("g")
    	.call(zoom);	
    this.updateVis();
}

MapVis.prototype.updateVis = function(){
	var that = this;
	this.g.append("g")
		.attr("id", "states")
      	.selectAll("path")
        .data(topojson.feature(this.mapData, this.mapData.objects.states).features)
      	.enter().append("path")
        .attr("d", this.path)
        .attr("fill", "#009900")
        .on("click", function(d){that.clicked(d, that)});
    
 	this.g.append("path")
    	.datum(topojson.mesh(this.mapData, this.mapData.objects.states, function(a, b) { return a !== b; }))
    	.attr("id", "state-borders")
    	.attr("d", this.path);
	
	var that = this;
	this.g.append("g")
		.attr("id", "hospitals")
		.selectAll("path")
		.data(this.hosData.features)
		.enter().append("path")
		.attr("d", this.path)
		.style("fill", function(d){
			if (d.properties.owner == 'Voluntary non-profit - Private'){
		return "#FF0000";
	}
	else if (d.properties.owner == 'Voluntary non-profit - Church'){
		return "#FF0000";
	}
	else if (d.properties.owner == 'Voluntary non-profit - Other'){
		return "#FF0000";
	}
	else if (d.properties.owner == 'Government - Hospital District or Authority') {
		return "#FFFF00";
	}
	else if (d.properties.owner == 'Government - Local')
		return "#FFFF00";
	else if (d.properties.owner == 'Government - State')
		return "#FFFF00";
	else if (d.properties.owner == 'Government Federal') 
		return "#FFFF00";
	else if (d.properties.owner =='Government - Federal'){
		return "#FFFF00";
	}
	else if(d.properties.owner == 'Proprietary'){
		return "#0066FF";
	}
	else if(d.properties.owner == 'Physician'){
		return "#0066FF";
	}
	else if (d.properties.owner == 'Tribal'){
		return "#cccccc";
	}
			})
		.on("click", function(d){
			$(that.eventHandler).trigger("selectionChanged", d);
		});  
	
}

MapVis.prototype.clicked = function(d, that){
	
	var x, y, k;
	if (d && that.centered !== d){
		var centroid = that.path.centroid(d);
		x = centroid[0]
		y = centroid[1]
		k = 4;
		that.centered = d;
	}
	else{
		x = that.width/2;
		y = that.height/2;
		k = 1;
		that.centered = null;
	}

	that.g.selectAll("path")
		.classed("active", that.centered && function(d){ return d === that.centered;})

	that.g.transition()
		.duration(750)
      	.attr("transform", "translate(" + that.width / 2 + "," + that.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      	.style("stroke-width", 1.5 / k + "px");

}

MapVis.prototype.zoomed = function(that){
	that.projection.translate(d3.event.translate).scale(d3.event.scale);
	that.g.selectAll("path").attr("d", that.path);
}

