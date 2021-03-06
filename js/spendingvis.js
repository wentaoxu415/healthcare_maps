SpendingVis = function (_parentElement, _spendingData, _hosData, _eventHandler) {
    this.parentElement = _parentElement;
    this.spendingData = _spendingData;
    this.hosData = _hosData;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.spending;
    this.tipData = 'a';
    this.tipMoney;
    this.last_tip = 'b';
    this.histarray;
    this.initVis();
}

SpendingVis.prototype.initVis = function () {
    var that = this;

    // selects svg, sets parameters
    this.svg = this.parentElement.selectAll("svg");
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;

    for (var key in this.spendingData) {
        if (this.spendingData[key]) {
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

    this.y = d3.scale.linear()
        .range([this.height - 50, 0]);

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
        .attr("transform", "translate(0," + (this.height - 50) + ")")
        .call(this.xAxis)
        .selectAll("text")
        .attr("y", 15)
        .attr("x", 10)
        .attr("transform", "rotate(45)")
        //.attr("text-anchor",  "start")
        //.style("text-anchor", "start")
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

SpendingVis.prototype.updateVis = function () {

    var that = this;

    var hist = d3.layout.histogram()
        .bins(this.x.ticks(20))
    (this.displayData);

    // //Add bars
    this.histarray = null;
    this.comparevalues(hist);

    this.y.domain([0, d3.max(hist, function (d) {
        return d.length;
    })])

    if (this.tipData != that.last_tip){
        this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-20, 0])
            .html(function (d) {
                return "<style='color:white'>"+that.tipData+"<br/>"+"$"+that.tipMoney+"</style>";
            })
    }
    this.svg.call(this.tip);

    this.svg.selectAll(".bar1").remove();

    var bar = this.svg.selectAll(".bar1")
        .data(hist)

    bar.exit().remove();

    bar.enter().append("g")
        .attr("class", "bar1")
        .attr("transform", function (d) {
            return "translate(" + that.x(d.x) + "," + that.y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", this.x(hist[1].dx) - 1)
        .attr("fill", function (d, i) {
            if (that.histarray == i) {
                that.tip.show(d, this);
                return "rgb(255, 204, 0)";
            } else {
                return "steelblue";
            }
        })
        .attr("height", function (d) {
            return that.height - 50 - that.y(d.y)
        })


    var formatCount = d3.format(",.0f");

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -15)
        .attr("x", this.x(hist[0].dx) / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#aaa")
        .text(function (d) {
            return formatCount(d.y) == 0 ? null : formatCount(d.y);
        })


}

SpendingVis.prototype.comparevalues = function (d) {
    var that = this;
    for (i = 0; i < d.length; i++) {
        for (e = 0; e < d[i].length; e++) {
            if (d[i][e] == that.spending || d[i][e] < that.spending && d[i][e + 1] > that.spending) {
                that.histarray = i;
            }
        }
    }
}

SpendingVis.prototype.onSelectionChange = function (d) {
    var that = this;
    var hospital = d.properties.name;
    this.spending = this.spendingData[hospital];
    this.updateVis();
    //console.log(this.spending);
}

SpendingVis.prototype.onMapSelectionChanged = function (d) {
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

    for (var key in this.spendingData) {
        if (this.spendingData[key]) {
            if (remove || selectedHospitals.indexOf(key) >= 0) {
                this.displayData.push(this.spendingData[key]);
            }
        }
    }

    this.updateVis();
}

SpendingVis.prototype.onMapSelectionHighlight = function (d) {
    var that = this;
    var hospital = d.el.properties.name;
    this.spending = d.highlight ? this.spendingData[hospital] : null;
    if (d.highlight) {
        this.tipData = hospital;
        this.last_tip = hospital;
        this.tipMoney = this.spendingData[hospital];
    }
    this.updateVis();
}
