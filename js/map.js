MapVis = function (_parentElement, _eventHandler) {
    this.parentElement = _parentElement;
    this.eventHandler = _eventHandler;
    this.initVis();
}

MapVis.prototype.initVis = function () {
    var that = this,
        width = 800,
        height = 500,
        active = d3.select(null);

    var elder = "Elder than 65",
        nonWhite = "Non-white",
        income = "Income";

///////////////////////////////////////////////////
//HELPER FUNCTIONS
    var drop_county_desc = function (county) {
        return county.toLowerCase()
            .replace(' county', '')
            .replace(' parish', '')
            .replace(' borough', '')
            .replace(' municipality', '')
            .replace(' city and borough', '');
    };

    var normalize_county = function (county) {
        return county.toLowerCase()
            .replace('saint', 'st.')
            .replace('st ', 'st. ')
            .replace('st..', 'st.')
            .replace('la salle', 'lasalle')
            .replace('la porte', 'laporte[')
            .replace('de kalb', 'dekalb')
            .replace('de soto', 'desoto');
    };

    var tooltip = {
        element: null,
        init: function () {
            this.element = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
        },
        show: function (t) {
            this.element.html(t).transition().duration(200).style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", 0.8);
        },
        move: function () {
            this.element.transition().duration(30).ease("linear").style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", 0.8);
        },
        hide: function () {
            this.element.transition().duration(500).style("opacity", 0)
        }
    };

    tooltip.init();

    var numFormat = d3.format(",d");
///////////////////////////////////////////////////
//SVG Initiaizations
    var projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);

    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map_vis").select("svg")
        //.attr("width", width)
        //.attr("height", height)
        .on("click", stopped, true);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

    var map = svg.append("g");

    svg
        .call(zoom) 
        .call(zoom.event);

////////////////////////////////////////////////////
//DATA INITIALIZATION 

    var countyData;
    var allData;
    var hospitalData;
    var selected = "NonWhite";
    var counties;
    var usStates;
    var filteredData;
    var state_income;
    var hospitalsByStateAndCounty = {},
        numHospitalsByState,
        numHospitalsByCounty;

    queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.csv, "data/allData.csv")
        .defer(d3.json, "data/hospital_final.json")
        .defer(d3.tsv, "data/us-state-names.tsv")
        .defer(d3.json, "data/state_demographics.json")
        .defer(d3.json, "data/county_demographics.json")
        .defer(d3.json, "data/state_counties.json")
        .defer(d3.json, "data/state_avg_income.json")
        .await(ready);
////////////////////////////////////////////////////
//CALCULATE NONWHITE, ELDER, INCOME 
    function ready(error, us, allPop, hospitals, us_states_names, state_demographics, county_demographics, state_counties, _state_income) {
        state_income = _state_income;
        d3.select("select").on("change", function () {
            selected = d3.select("select").node().value;
            changeMap(selected);
            changeCounties(selected);
        });

        usStates = us_states_names;

        var incomePpl = [1, 5000, 17500, 37500, 62500, 150000, 300000];

        allData = allPop;

        allData.forEach(function (item) {
            // Parsing data for demographics
            var currentDemographics,
                nonWhiteValue = 0,
                elderValue = 0;

            if (item.state == item.name) {
                currentDemographics = state_demographics[item.name];
            } else {
                var curIndex = drop_county_desc(normalize_county(item.name));
                currentDemographics = county_demographics[curIndex];
            }
            if (currentDemographics) {
                Object.keys(currentDemographics).forEach(function (d) {
                    if (['hispanic', 'black', 'asian', 'native'].indexOf(d) >= 0) {
                        nonWhiteValue = nonWhiteValue + (isNaN(parseInt(currentDemographics[d])) ? 0 : parseInt(currentDemographics[d]));
                    } else if (['65_74', 'over_85', 'over_75'].indexOf(d) >= 0) {
                        elderValue = elderValue + (isNaN(parseInt(currentDemographics[d])) ? 0 : parseInt(currentDemographics[d]));
                    }
                });
            }

            item.NonWhite = nonWhiteValue;
            item.Elder = elderValue;


            // Parsing data for income
            var currentState = us_states_names.filter(function (d) {
                    return d.name == item.state;
                }),
                incomeValue;
            if (currentState) {
                var currentStateCode = currentState[0].code,
                    dataState = state_counties[currentStateCode];                 
                if (dataState) {
                    if (item.state == item.name) {
                        incomeValue = 0;
                        Object.keys(dataState).forEach(function (county) {
                            if (dataState[county].length > 0) {
                                var sum = dataState[county].reduce(function (a, b) {
                                    return parseInt(a) + parseInt(b)
                                });
                                dataState[county].forEach(function (d, i) {
                                    if (i <= 6) {
                                        incomeValue = incomeValue + parseInt(d) / sum * incomePpl[i];
                                    }
                                });
                            }
                        });
                    } 
                else {
                    incomeValue = 0;
                    var county = drop_county_desc(normalize_county(item.name));
                    if (dataState[county] && dataState[county].length > 0) {
                        var sum = dataState[county].reduce(function (a, b) {
                            return parseInt(a) + parseInt(b)
                        });
                        dataState[county].forEach(function (d, i) {
                            if (i <= 6) {

                                incomeValue = incomeValue + parseInt(d) / sum * incomePpl[i];
                            }
                        });
                    }
                }
                }
            }
            item.Income = Math.round(incomeValue);
        });

////////////////////////////////////////////////////
        hospitalData = hospitals;
        hospitalsByStateAndCounty = d3.nest()
            .key(function (h) {
                return h.properties['state'];
            })
            .key(function (h) {
                return h.properties['county'];
            })
            .entries(hospitals['features']);

        numHospitalsByState = hospitalsByStateAndCounty.reduce(function (map, d) {
            map[d.key] = d3.sum(d.values.map(function (c) {
                return c.values.length;
            }));
            return map;
        }, {});

        numHospitalsByCounty = hospitalsByStateAndCounty.reduce(function (map, d) {
            d.values.forEach(function (c) {
                map[d.key + '.' + c.key] = c.values.length;
            });
            return map;
        }, {});


        var popStates = allPop.filter(function (d) {
            return +d.countyId === 0;
        })

        countyData = topojson.feature(us, us.objects.counties).features;

        var popStatesExtent = d3.extent(popStates, function (d) {
            return +d[selected];
        });

        var rateById = {};
        var nameById = {};

        popStates.forEach(function (d) {
            rateById[d.stateId] = +d[selected];
            nameById[d.stateId] = d.state;
        });

        var colorScale = d3.scale.linear()
            .domain(popStatesExtent)
            .range(["rgb(255, 255, 178)", "rgb(31, 178, 36)"]);

        var fontScale = d3.scale.linear()
            .domain(d3.extent(d3.values(numHospitalsByState)))
            .range([12, 28]);

        var states_features = topojson.feature(us, us.objects.states).features;
        var states = map.selectAll("path .feature")
            .data(states_features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function (d, i) {
                return colorScale(rateById[d.id]);
            })
            .attr("class", "feature")
            .on("click", clicked);

        map.append("path")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            }))
            .attr("class", "mesh")
            .attr("d", path);

        var numHospitalsLabels = map.selectAll("text.state_num_hospitals")
            .data(hospitalsByStateAndCounty)
            .enter()
            .append("text")
            .attr('class', 'state_num_hospitals')
            .attr('id', function (d) {
                return 'state_num_hospitals_' + d.key;
            })
            .attr("x", function (d) {
                var stateId = usStates.filter(function (s) {
                    return s.code == d.key;
                })[0].id;
                var feature = states_features.filter(function (s) {
                    return s.id == stateId;
                })[0];
                var centroid = path.centroid(feature);
                return centroid[0];
            })
            .attr("y", function (d) {
                var stateId = usStates.filter(function (s) {
                    return s.code == d.key;
                })[0].id;
                var feature = states_features.filter(function (s) {
                    return s.id == stateId;
                })[0];
                var centroid = path.centroid(feature);
                return centroid[1];
            })
            .style('font-size', function (d) {
                var numHospitals = numHospitalsByState[d.key];
                return Math.round(fontScale(numHospitals)) + 'px';
            })
            .style('text-anchor', 'middle')
            .text(function (d, i) {
                return numHospitalsByState[d.key];
            })
            .on("click", function (d) {
                var stateId = usStates.filter(function (s) {
                    return s.code == d.key;
                })[0].id;
                var feature = states_features.filter(function (d) {
                    return d.id == stateId;
                })[0];
                clicked(feature);
            });


        states
            .on("mouseover", function (d, i) {
                tooltip.show("<b>" + nameById[d.id] + "</b>" + "<br>" + selected + ": " + numFormat(rateById[d.id]));
            })
            .on("mousemove", function (d, i) {
                tooltip.move();
            })
            .on("mouseout", function (d, i) {
                tooltip.hide();
            });


        // map.append()


        function changeMap(selected) {

//Population,Births,Deaths,NatiralInc,InternationalMig,DomesticMig,NetMig


            selected === "NonWhite" ? d3.select(".desc").text(nonWhite) :
                selected === "Elder" ? d3.select(".desc").text(elder) :
                    selected === "Income" ? d3.select(".desc").text(income) :
                        d3.select(".desc").text(income);


            //d3.select(".desc").text(selected);

            popStatesExtent = d3.extent(popStates, function (d) {
                return +d[selected];
            });




            var rateById = {};
            var nameById = {};

            popStates.forEach(function (d) {
                rateById[d.stateId] = +d[selected];
                nameById[d.stateId] = d.state;
            });


            if (selected == "Income"){
                popStates.forEach(function (d) {
                rateById[d.stateId] = state_income[d.state];
                nameById[d.stateId] = d.state;
                });
                popStatesExtent = [30000, 75000]
            }
            
            colorScale = d3.scale.linear()
                .domain(popStatesExtent)
                .range(["rgb(255, 255, 178)", "rgb(31, 178, 36)"]);

            states.transition()
                .duration(500)
                .style("fill", function (d, i) {
                    return colorScale(rateById[d.id]);
                });


            states.on("mouseover", function (d, i) {
                tooltip.show("<b>" + nameById[d.id] + "</b>" + "<br>" + selected + ": " + numFormat(rateById[d.id]));
            })
                .on("mousemove", function (d, i) {
                    tooltip.move();
                })
                .on("mouseout", function (d, i) {
                    tooltip.hide();
                });


        }

        //createMap(selected);


    };

    function clicked(d) {

        tooltip.hide();
        d3.selectAll(".feature").style("opacity", 0.3);
        d3.selectAll('.hospital_icon').remove();

        d3.selectAll(".counties").remove();
        d3.selectAll(".county_num_hospitals").remove();
        d3.selectAll(".state_num_hospitals").attr("visibility", "visible");

        if (active.node() === this) return reset();
        active.classed("active", false);

        if (d3.select(this)[0][0] && d3.select(this)[0][0].tagName == "path") {
            active = d3.select(this).classed("active", true);
        }

        var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        filteredData = allData.filter(function (e) {
            return +e.stateId === +d.id
        });

        filteredData.shift();

        filteredData.forEach(function (e) {
            e.id = d.id * 1000 + (+e.countyId)
        })


        var filteredDataExtent = d3.extent(filteredData, function (d) {
            return +d[selected];
        });


        var rateById = {};
        var nameById = {};
        var dataById = {}

        filteredData.forEach(function (d) {
            rateById[d.id] = +d[selected];
            nameById[d.id] = d.name;
            dataById[+d.id] = d;
        });

        //filteredData.forEach(function(d) { rateById[d.id] = +d.population; });

        var colorScale = d3.scale.linear()
            .domain(filteredDataExtent)
            .range(["rgb(255, 255, 178)", "rgb(31, 178, 36)"]);

        var countyFeatures = countyData.filter(function (e) {
            return e.id > d.id * 1000 && e.id < d.id * 1000 + 1000;
        });
        counties = map.selectAll(".counties")
            .data(countyFeatures)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function (d, i) {
                return colorScale(rateById[d.id]);
            })
            .attr("class", "counties")
            .on("click", clickedCounty);

        var selectedState = usStates.filter(function (s) {
            return s.id == d.id;
        })[0];
        var stateId = selectedState.id;
        var stateCode = selectedState.code;

        var stateHospitals = hospitalsByStateAndCounty.filter(function (s) {
            return s.key == stateCode;
        });
        var numHospitalsByCountyValues = d3.keys(numHospitalsByCounty).filter(function (k) {
            return k.indexOf(stateCode) == 0;
        }).map(function (k) {
            return numHospitalsByCounty[k];
        })

        var fontScale = d3.scale.linear()
            .domain(d3.extent(numHospitalsByCountyValues))
            .range([5, 10]);

        if (stateHospitals && stateHospitals.length) {
            stateHospitals = stateHospitals[0].values;
            var numCountyHospitalsLabels = map.selectAll("text.county_num_hospitals")
                .data(stateHospitals)
                .enter()
                .append("text")
                .attr('class', 'county_num_hospitals state_' + stateCode)
                .on("click", function (d) {
                    var countyName = normalize_county(d.key),
                        countyId = allData.filter(function (d) {
                            return d.stateId == stateId && drop_county_desc(d.name) == countyName;
                        });
                    if (countyId) {
                        var feature = countyFeatures.filter(function (s) {
                                return s.id == countyId[0].id;
                            })[0],
                            path = counties[0][countyFeatures.indexOf(feature)];
                    }

                    clickedCounty(feature, path);
                })
                .attr("x", function (d) {
                    var position = getStateNumberPosition(this);
                    return position.x;
                })
                .attr("y", function (d) {
                    var position = getStateNumberPosition(this);
                    return position.y;
                })
                .attr("visibility", "hidden")
                .transition()
                .delay(300)
                .duration(1000)
                .attr("visibility", "visible")
                .attr("x", function (d) {
                    var countyName = normalize_county(d.key);
                    var countyId = allData.filter(function (d) {
                        return d.stateId == stateId && drop_county_desc(d.name) == countyName;
                    });
                    if (countyId.length > 0) {
                        var feature = countyFeatures.filter(function (s) {
                            return s.id == countyId[0].id;
                        })[0];
                        var centroid = path.centroid(feature);
                        return centroid[0];
                    }
                })
                .attr("y", function (d) {
                    var countyName = normalize_county(d.key);
                    var countyId = allData.filter(function (d) {
                        return d.stateId == stateId && drop_county_desc(d.name) == countyName;
                    });
                    if (countyId.length > 0) {
                        var feature = countyFeatures.filter(function (s) {
                            return s.id == countyId[0].id;
                        })[0];
                        var centroid = path.centroid(feature);
                        return centroid[1];
                    }
                })
                .style('font-size', function (d) {
                    var numHospitals = numHospitalsByCounty[stateCode + '.' + d.key];
                    return Math.round(fontScale(numHospitals)) + 'px';
                })
                .style('text-anchor', 'middle')
                .text(function (d, i) {
                    return numHospitalsByCounty[stateCode + '.' + d.key];
                });
        }
        counties
            .on("mouseover", function (d, i) {
                tooltip.show("<b>" + nameById[d.id] + "</b>" + "<br>" + selected + ": " + numFormat(rateById[d.id]));
            })
            .on("mousemove", function (d, i) {
                tooltip.move();
            })
            .on("mouseout", function (d, i) {
                //createStuff();
                tooltip.hide();
            });

        svg.transition()
            .duration(750)
            .call(zoom.translate(translate).scale(scale).event);

        $(that.eventHandler).trigger("mapSelectionChanged", {state: selectedState});

        //d3.select('#state_num_hospitals_'+ stateCode).attr("visibility", "hidden");
        d3.selectAll(".state_num_hospitals").attr("visibility", "hidden");
    }


    function clickedCounty(c, el) {

        var rateById = {},
            nameById = {},
            dataById = {};

        filteredData.forEach(function (d) {
            rateById[d.id] = +d[selected];
            nameById[d.id] = d.name;
            dataById[+d.id] = d;
        });

        if (active.node() === this || active.node() === el) return reset();
        active.classed("active", false);

        if (d3.select(this)[0][0] && d3.select(this)[0][0].tagName == "path") {
            active = d3.select(this).classed("active", true);
        } else {
            active = d3.select(el).classed("active", true);
        }

        d3.selectAll('.hospital_icon').remove();
        var countyId = +c.id;
        var thisCountyData = dataById[countyId];
        var stateName = thisCountyData.state;
        var countyName = thisCountyData.name.toLowerCase().replace(' county', '');
        var countyHospitals = hospitalData['features'].filter(function (h) {
            return h.properties['county'].toLowerCase() == countyName;
        });

        var bounds = path.bounds(c),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition()
            .duration(1000)
            .call(zoom.translate(translate).scale(scale).event);

        var hospitals = map.selectAll(".hospital")
            .data(countyHospitals)
            .enter().append("svg:image")
            .attr('class', 'hospital_icon')
            .attr('width', 1)
            .attr('height', 1)
            .attr("transform", function (d) {
                return "translate(" + projection([
                        d.geometry.coordinates[0],
                        d.geometry.coordinates[1]
                    ]) + ")"
            })
            .attr('xlink:href', 'img/hospital.png')
            .on('mouseover', function (d) {
                var info = d.properties;
                tooltip.show("<b> " + info.name + "</b>" + "<br/>" + info.owner + '<br/>' + info.address + "<br/>" + info.city + ', ' + info.state + ' '
                + info.zip + '<br/>');
            })
            .on("click", function (d) {
                $('.d3-tip').remove();

                if (d3.select(this).attr('height') == 2) {
                    d3.select(this).attr('height', 1).attr('width', 1);
                    $(that.eventHandler).trigger("mapSelectionHighlight", {el: d, highlight: false});
                } else {
                    d3.selectAll('.hospital_icon').attr('height', 1).attr('width', 1);
                    d3.select(this).attr('height', 2).attr('width', 2);
                    $(that.eventHandler).trigger("mapSelectionHighlight", {el: d, highlight: true});
                }
                $(that.eventHandler).trigger("selectionChanged", d);
            });

        $(that.eventHandler).trigger("mapSelectionChanged", {county: countyName});
        
    }

    function changeCounties(selected) {

        var filteredDataExtent = d3.extent(filteredData, function (d) {
            return +d[selected];
        });

        var rateById = {};
        var nameById = {};

        filteredData.forEach(function (d) {
            rateById[d.id] = +d[selected];
            nameById[d.id] = d.name;
        });

        //filteredData.forEach(function(d) { rateById[d.id] = +d.population; });

        var colorScale = d3.scale.linear()
            .domain(filteredDataExtent)
            .range(["rgb(255, 255, 178)", "rgb(31, 178, 36)"]);

        counties
            .transition()
            .style("fill", function (d, i) {
                return colorScale(rateById[d.id]);
            })


        counties.on("mouseover", function (d, i) {
            tooltip.show("<b>" + nameById[d.id] + "</b>" + "<br>" + selected + ": " + numFormat(rateById[d.id]));
        });


        counties.on("mousemove", function (d, i) {
            tooltip.move();
        })
            .on("mouseout", function (d, i) {
                //createStuff();
                tooltip.hide();
            });


    }


    function getStateNumberPosition(element) {
        var currentState = d3.select(element).attr("class")
                .substr(d3.select(element).attr("class").indexOf("state_"), d3.select(element).attr("class").length)
                .replace("state_", ""),
            currentStateNumber = d3.select("#state_num_hospitals_" + currentState),
            statePosition = {
                x: currentStateNumber.attr("x"),
                y: currentStateNumber.attr("y")
            };

        return statePosition;
    }


    function reset() {
        var delay = 700,
            duration = 1000;

        tooltip.hide();
        d3.selectAll(".counties").remove();
        d3.selectAll(".hospital").remove();
        d3.selectAll(".hospital_icon").remove();

        d3.selectAll(".county_num_hospitals").transition()
            .duration(duration)
            .attr("x", function (d) {
                var position = getStateNumberPosition(this);
                return position.x;
            })
            .attr("y", function (d) {
                var position = getStateNumberPosition(this);
                return position.y;
            });

        d3.selectAll(".county_num_hospitals").transition().delay(delay - 100).duration(duration).attr("visibility", "hidden");
        d3.selectAll(".state_num_hospitals").transition().delay(delay - 100).duration(duration).attr("visibility", "visible");
        d3.selectAll(".feature").transition().delay(delay).duration(duration).style("opacity", 1);
        active.classed("active", false);
        active = d3.select(null);

        svg.transition()
            .delay(delay)
            .duration(750)
            .call(zoom.translate([0, 0]).scale(1).event);

        $(that.eventHandler).trigger("mapSelectionChanged", {});
    }

    function zoomed() {
        map.style("stroke-width", 1.5 / d3.event.scale + "px");
        map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        // zoomed
    }

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
    function stopped() {
        if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }
}