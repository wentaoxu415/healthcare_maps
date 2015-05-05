InfoVis = function(_parentElement, _mapData, _hosData, _eventHandler){
	this.parentElement = _parentElement;
	this.mapData = _mapData;
	this.hosData = _hosData;
	this.eventHandler = _eventHandler;
	this.displayData = [];
}

InfoVis.prototype.onSelectionChange = function(d){
	d3.select("#hospital_name").text("Name: "+d.properties.name);
	d3.select("#hospital_address").text("Address : "+d.properties.address);
	d3.select("#hospital_city").text("City: "+d.properties.city);
	d3.select("#hospital_county").text("County: "+d.properties.county);
	d3.select("#hospital_state").text("State: "+d.properties.state);
	d3.select("#hospital_type").text("Hospital Type: "+d.properties.owner);

}

