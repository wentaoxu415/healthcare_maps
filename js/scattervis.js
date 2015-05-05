ScatterVis = function (_parentElement, _scatterData, _hosData, _eventHandler) {
    this.parentElement = _parentElement;
    this.scatterData = _scatterData;
    this.hosData = _hosData;
    this.scatter = null;
    this.tipData = '';
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.initVis();
}

ScatterVis.prototype.initVis = function () {
    var that = this;
    this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;


    for (var key in this.scatterData) {
        if (this.scatterData[key]) {
            this.displayData.push(this.scatterData[key])
        }
    }

    this.x = d3.scale.linear()
        .domain(d3.extent(this.displayData, function (d) {
            return d["spending"];
        })).nice()
        .range([0, this.width]);

    this.y = d3.scale.linear()
        // .domain(d3.extent(this.displayData, function (d) {
        //     return d["quality"];
        // })).nice()
        .domain(d3.extent(this.displayData, function (d) {
            return -1*d["quality"];
        })).nice()
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

    this.updateVis();
}

ScatterVis.prototype.updateVis = function () {
    var that = this;

    console.log(this.displayData);

    this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-20, 0])
        .html(function (d) {
            return "<style='color:white'>" + that.tipData + "</style>";
        })

    this.svg.call(this.tip);

    var dot = this.svg.selectAll(".dot").data(this.displayData);

    dot.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 2.5)
        .attr("cx", function (d) {
            return that.x(d["spending"])
        })
        .attr("cy", function (d) {
            return that.y(d["quality"])
        });

    dot.interrupt()
        .attr("r", function (d, i) {
            return (i == that.scatter) ? 7 : 2.5;
        })
        .style("fill", function (d, i) {
            if (i == that.scatter) {
                that.tip.show(d, this);
                return "rgb(255, 204, 0)";
            } else {
                return "steelblue";
            }
        });

    dot.exit().remove();
}

ScatterVis.prototype.onMapSelectionChanged = function (d) {
    var that = this;

    this.displayData = [],
        selectedHospitals = [],
        remove = false;

    if (d.state) {
        var stateHospitalsData = that.hosData.features.filter(function (data) {
            return data.properties.state == d.state.code;
        });
        selectedHospitals = stateHospitalsData.map(function (hos) {
            return hos.properties.name;
        });

    } else if (d.county) {
        var stateHospitalsData = that.hosData.features.filter(function (data) {
            return data.properties.county.toLowerCase() == d.county;
        });
        selectedHospitals = stateHospitalsData.map(function (hos) {
            return hos.properties.name;
        });
    } else {
        remove = true;
    }

    for (var key in this.scatterData) {
        if (this.scatterData[key]) {
            if (remove || selectedHospitals.indexOf(key) >= 0) {
                this.displayData.push(this.scatterData[key]);
            }
        }
    }

    this.updateVis();
}

ScatterVis.prototype.onMapSelectionHighlight = function (d) {
    var that = this;
    var hospital = d.el.properties.name;
    this.scatter = d.highlight ? this.displayData.indexOf(this.scatterData[hospital]) : null;
    if (d.highlight) {
        this.tipData = hospital + '<br/>quality: ' + this.scatterData[hospital].quality + ', spending: ' + this.scatterData[hospital].spending;
    }
    this.updateVis();
}