QualityVis = function (_parentElement, _qualityData, _hosData, _eventHandler) {
    this.parentElement = _parentElement;
    this.qualityData = _qualityData;
    this.hosData = _hosData;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.quality;
    this.tipData = '';
    this.histarray;
    this.first = true;
    this.initVis();
}

QualityVis.prototype.initVis = function () {
    var that = this;

    // selects svg, sets parameters
    this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;

    for (var key in this.qualityData) {
        if (this.qualityData[key]) {
            this.displayData.push(this.qualityData[key])
        }
    }

    this.svg = this.svg
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.x = d3.scale.linear()
        .domain([d3.min(this.displayData, function (d) {
            return d;
        }), d3.max(this.displayData, function (d) {
            return d;
        })])
        .range([0, this.width - 50]);

    this.y = d3.scale.linear()
        .range([this.height - 50, 0]);

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
        .text(function (d, i) {
            return d
        })
        .attr("font-size", 12);

    this.svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)");

    this.updateVis();

}

QualityVis.prototype.updateVis = function () {
    // //Add bars
    var that = this;
    var hist = d3.layout.histogram()
        .bins(this.x.ticks(50))
    (this.displayData);

    this.y.domain([0, d3.max(hist, function (d) {
        return d.length;
    })]);

    this.histarray = null;
    this.comparevalues(hist);

    this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-20, 0])
        .html(function (d) {
            return "<style='color:white'>" + that.tipData + "</style>";
        })

    this.svg.call(this.tip);

    this.svg.selectAll(".bar1").remove();

    var bar = this.svg.selectAll(".bar1")
        .data(hist)


    bar.enter().append("g")
        .attr("class", "bar1")
        .attr("transform", function (d) {
            return "translate(" + that.x(d.x) + "," + that.y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", (that.width - 50) / 50 - 3.5)
        .attr("height", function (d) {
            return that.height - 50 - that.y(d.y)
        })
        .attr("fill", function (d, i) {
            if (that.histarray == i) {
                that.tip.show(d, this);
                return "rgb(255, 204, 0)"
            } else return "steelblue"
        })


    var formatCount = d3.format(",.0f");

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -10)
        .attr("x", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#aaa")
        .attr("font-size", 8)
        .text(function (d) {
            return formatCount(d.y) == 0 ? null : formatCount(d.y);
        })
}

QualityVis.prototype.comparevalues = function (d) {
    var that = this;
    for (i = 0; i < d.length; i++) {
        for (e = 0; e < d[i].length; e++) {
            if (d[i][e] == that.quality || d[i][e] < that.quality && d[i][e + 1] > that.quality) {
                that.histarray = i;
            }
        }
    }
}

QualityVis.prototype.onSelectionChange = function (d) {
    var that = this;
    var hospital = d.properties.name;
    this.quality = this.qualityData[hospital];
    this.updateVis();
}


QualityVis.prototype.onMapSelectionChanged = function (d) {
    var that = this;

    this.displayData = [],
        selectedHospitals = [],
        remove = false;

    if (d.state) {
        console.log(d.state);
        var stateHospitalsData = that.hosData.features.filter(function (data) {
            return data.properties.state == d.state.code;
        });
        selectedHospitals = stateHospitalsData.map(function (hos) {
            return hos.properties.name;
        });

    } else if (d.county) {
        console.log(d.county);
        var stateHospitalsData = that.hosData.features.filter(function (data) {
            return data.properties.county.toLowerCase() == d.county;
        });
        selectedHospitals = stateHospitalsData.map(function (hos) {
            return hos.properties.name;
        });

    } else {
        console.log("exit?");
        remove = true;
        that.first = true;
    }

    for (var key in this.qualityData) {
        if (this.qualityData[key]) {
            if (remove || selectedHospitals.indexOf(key) >= 0) {
                this.displayData.push(this.qualityData[key]);
            }
        }
    }

    this.updateVis();
}

QualityVis.prototype.onMapSelectionHighlight = function (d) {
    var that = this;
    var hospital = d.el.properties.name;
    this.quality = d.highlight ? this.qualityData[hospital] : null;
    console.log("when?");
    if (d.highlight) {
        this.tipData = hospital + '<br/>' + this.qualityData[hospital];
        console.log(this.tipData);
    }
    this.updateVis();
}