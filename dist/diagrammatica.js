(function(exports, global) {
    global["diagrammatica"] = exports;
    "use strict";
    var BarBase = function(selection, data, orientation) {
        this.selection = check.string(selection) ? d3.select(selection) : selection;
        this.data = data;
        var chart = this.chart = new ChartBase(this.selection, "bar");
        var config = this.config = chart.config;
        orientation = this.orientation = orientation || "horizontal";
        var isHorizontal = this.isHorizontal = function() {
            return orientation === "horizontal";
        };
        chart.xScale = d3.scale.ordinal();
        chart.yScale = d3.scale.linear();
        this.updateX = function(newData) {
            data = check.defined(newData) ? newData : data;
            var xScaleRange = isHorizontal() ? [ 0, config.paddedHeight() ] : [ 0, config.paddedWidth() ];
            chart.xScale.domain(data.map(function(d) {
                return d.name;
            })).rangeRoundBands(xScaleRange, .1);
            var xAxisOrient = isHorizontal() ? "left" : "bottom";
            chart.xAxis = d3.svg.axis().scale(chart.xScale).orient(xAxisOrient);
        };
        this.updateY = function(newData) {
            data = check.defined(newData) ? newData : data;
            chart.yScale.domain([ 0, d3.max(data, function(d) {
                return d.value;
            }) ]);
            var yScaleRange = isHorizontal() ? [ 0, config.paddedWidth() ] : [ config.paddedHeight(), 0 ];
            chart.yScale.range(yScaleRange);
            var yAxisOrient = isHorizontal() ? "bottom" : "left";
            chart.yAxis = d3.svg.axis().scale(chart.yScale).orient(yAxisOrient);
        };
        this.updateX();
        this.updateY();
        config.tooltipHtml = function(d) {
            var html = '<div class="left-arrow diagrammatica-tooltip-inline"></div>';
            html += '<div class="diagrammatica-tooltip-content diagrammatica-tooltip-inline">' + d.value + "</div>";
            return html;
        };
    };
    BarBase.prototype.renderAxis = function(axis) {
        var chart = this.chart;
        var config = this.config;
        var selection = chart.renderArea.append("g").attr("class", axis + " axis").call(chart[axis + "Axis"]);
        var text = selection.append("text").attr("class", axis + " label").attr("text-anchor", "middle");
        if (this.isHorizontal() && axis === "x" || !this.isHorizontal() && axis === "y") {
            text.attr("transform", "rotate(-90)").attr("x", config.paddedHeight() / 2 * -1).attr("y", config.margin.left * -1).attr("dy", "1em");
        } else {
            selection.attr("transform", "translate(0," + config.paddedHeight() + ")");
            text.attr("x", config.paddedWidth() / 2).attr("y", 28);
        }
        return this;
    };
    BarBase.prototype.renderBars = function() {
        var chart = this.chart;
        var data = this.data;
        var config = this.config;
        this.bars = chart.renderArea.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar diagrammatica-tooltip-target").attr("fill", function(d) {
            return chart.colors(d.value);
        }).on("mouseover", function(d) {
            tooltip.transition().style("opacity", 1);
            var parentBox = this.getBoundingClientRect();
            var tooltipBox = tooltip.node().getBoundingClientRect();
            var boxHeightOffset = (parentBox.height - tooltipBox.height) / 2;
            tooltip.html(config.tooltipHtml(d)).style("left", parentBox.right + "px").style("top", parentBox.top + scrollPosition().y + boxHeightOffset + "px");
        }).on("mouseout", function() {
            tooltip.style("opacity", 0);
        });
        var x = 0;
        var y = function(d) {
            return chart.xScale(d.name);
        };
        var width = function(d) {
            return chart.yScale(d.value);
        };
        var height = chart.xScale.rangeBand();
        if (!this.isHorizontal()) {
            x = function(d) {
                return chart.xScale(d.name);
            };
            y = function(d) {
                return chart.yScale(d.value);
            };
            width = chart.xScale.rangeBand();
            height = function(d) {
                return config.paddedHeight() - chart.yScale(d.value);
            };
        }
        this.bars.attr("x", x).attr("y", y).attr("width", width).attr("height", height);
        return this;
    };
    BarBase.prototype.render = function() {
        this.renderAxis("x");
        this.renderAxis("y");
        this.renderBars();
        return this;
    };
    BarBase.prototype.updateAxes = function(data) {
        var chart = this.chart;
        var config = this.config;
        this.updateY(data);
        var yAxisSelection = chart.renderArea.select(".y.axis").transition().call(chart.yAxis);
        this.updateX(data);
        var xAxisSelection = chart.renderArea.select(".x.axis").transition().call(chart.xAxis);
        var axisToTranslate = this.isHorizontal() ? yAxisSelection : xAxisSelection;
        axisToTranslate.attr("transform", "translate(0," + config.paddedHeight() + ")");
        return this;
    };
    BarBase.prototype.updateBars = function(data) {
        var chart = this.chart;
        var bars = this.bars;
        var config = this.config;
        var barTransition = bars.data(data).transition();
        if (this.isHorizontal()) {
            barTransition.attr("y", function(d) {
                return chart.xScale(d.name);
            }).attr("width", function(d) {
                return chart.yScale(d.value);
            }).attr("height", chart.xScale.rangeBand());
        } else {
            barTransition.attr("x", function(d) {
                return chart.xScale(d.name);
            }).attr("y", function(d) {
                return chart.yScale(d.value);
            }).attr("width", chart.xScale.rangeBand()).attr("height", function(d) {
                return config.paddedHeight() - chart.yScale(d.value);
            });
        }
    };
    var bar = function(selection, data, orientation) {
        var barBase = new BarBase(selection, data, orientation).render();
        var chart = barBase.chart;
        var config = barBase.config;
        var updateX = barBase.updateX;
        var updateY = barBase.updateY;
        var bars = barBase.bars;
        var update = chart.update = function(newData) {
            data = check.defined(newData) ? newData : data;
            barBase.updateAxes(data);
            barBase.updateBars(data);
        };
        update.height = function(value) {
            var axis = barBase.isHorizontal() ? "x" : "y";
            return chart.height(value, function() {
                updateX();
                barBase.selection.select("." + axis + ".axis .label").transition().attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1);
            });
        };
        update.width = function(value) {
            var axis = barBase.isHorizontal() ? "y" : "x";
            return chart.width(value, function() {
                updateY();
                barBase.selection.select("." + axis + ".axis .label").transition().attr("x", config.paddedWidth() / 2).attr("y", 28);
            });
        };
        update.yAxisLabelText = function(value) {
            return chart.yAxisLabelText(value);
        };
        update.xAxisLabelText = function(value) {
            return chart.xAxisLabelText(value);
        };
        update.chartBase = function() {
            return chart;
        };
        update.updateY = function() {
            return updateY;
        };
        update.updateX = function() {
            return updateX;
        };
        update.bars = function() {
            return bars;
        };
        return update;
    };
    "use strict";
    var ChartBase = function(selection, chartClass) {
        this.hasRenderedOnce = false;
        this.selection = check.string(selection) ? d3.select(selection) : selection;
        this.update = function() {};
        var config = {
            margin: {
                top: 20,
                right: 20,
                bottom: 30,
                left: 40
            },
            width: 480,
            height: 250
        };
        this.config = config;
        this.config.paddedWidth = function() {
            return config.width - config.margin.left - config.margin.right;
        };
        this.config.paddedHeight = function() {
            return config.height - config.margin.top - config.margin.bottom;
        };
        this.config.tooltipHtml = function() {
            return "tooltip content";
        };
        this.svg = this.selection.append("svg").attr("class", "diagrammatica diagrammatica-" + chartClass).attr("width", config.width).attr("height", config.height);
        this.renderArea = this.svg.append("g").attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
        this.updateDimensions = function() {
            this.svg.attr("width", config.width).attr("height", config.height);
            this.renderArea.attr("transform", "translate(" + this.config.margin.left + "," + this.config.margin.top + ")");
        };
        this.xScale = function() {};
        this.xAxis = function() {};
        this.yScale = function() {};
        this.yAxis = function() {};
        this.colors = d3.scale.category10();
    };
    ChartBase.prototype.axisLabelText = function(axisLetter, value) {
        var label = this.selection.select("." + axisLetter + ".axis .label");
        if (check.not.defined(value)) {
            return label.empty() ? "" : label.text();
        }
        label.text(value);
        return this.update;
    };
    ChartBase.prototype.yAxisLabelText = function(value) {
        return this.axisLabelText("y", value);
    };
    ChartBase.prototype.xAxisLabelText = function(value) {
        return this.axisLabelText("x", value);
    };
    ChartBase.prototype.setDimension = function(value, axisUpdateCallback, property) {
        if (!check.defined(value)) {
            return this.config[property];
        }
        this.config[property] = value;
        if (check.defined(axisUpdateCallback)) {
            axisUpdateCallback();
        }
        this.svg.attr(property, this.config[property]);
        this.updateDimensions();
        return this.update;
    };
    ChartBase.prototype.width = function(value, axisUpdateCallback) {
        return this.setDimension(value, axisUpdateCallback, "width");
    };
    ChartBase.prototype.height = function(value, axisUpdateCallback) {
        return this.setDimension(value, axisUpdateCallback, "height");
    };
    ChartBase.prototype.tooltipHtml = function(value) {
        if (!arguments.length) {
            return this.config.tooltipHtml();
        }
        this.config.tooltipHtml = value;
        return this.update;
    };
    "use strict";
    function scrollPosition() {
        if (typeof window.scrollX === "number" && typeof window.scrollY === "number") {
            return {
                x: window.scrollX,
                y: window.scrollY
            };
        }
        if (typeof window.pageXOffset === "number" && typeof window.pageYOffset === "number") {
            return {
                x: window.pageXOffset,
                y: window.pageYOffset
            };
        }
        var doc = document.documentElement || document.body.parentNode;
        if (typeof doc.ScrollLeft !== "number" || typeof doc.ScrollTop !== "number") {
            doc = document.body;
        }
        return {
            x: doc.scrollLeft,
            y: doc.scrollTop
        };
    }
    "use strict";
    var HeatMapBase = function(selection, data) {
        selection = this.selection = check.string(selection) ? d3.select(selection) : selection;
        this.data = data;
        var chart = this.chart = new ChartBase(selection, "heat-map");
        var config = this.config = chart.config;
        config.margin.top = 55;
        config.margin.bottom = 40;
        config.margin.left = 50;
        chart.updateDimensions();
        this.dates = d3.set(data.map(function(d) {
            return d.date;
        })).values();
        this.cellWidth = Math.floor(config.paddedWidth() / this.dates.length);
        this.categories = d3.set(data.map(function(d) {
            return d.category;
        })).values();
        this.cellHeight = Math.floor(config.paddedHeight() / this.categories.length);
        this.buckets = 9;
        this.colors = colorbrewer.OrRd[this.buckets];
    };
    HeatMapBase.prototype.renderRectangles = function() {
        var chart = this.chart;
        var data = this.data;
        var config = this.config;
        var cellHeight = this.cellHeight;
        var cellWidth = this.cellWidth;
        var dates = this.dates;
        var buckets = this.buckets;
        var categories = this.categories;
        var colors = this.colors;
        var xCellScale = d3.scale.linear().domain([ 0, dates.length - 1 ]).range([ 0, config.paddedWidth() - cellWidth ]);
        var yCellScale = d3.scale.ordinal().domain(data.map(function(d) {
            return d.category;
        })).rangeRoundBands([ 0, config.paddedHeight() + 3 ]);
        chart.colors = d3.scale.quantile().domain([ 0, buckets - 1, d3.max(data, function(d) {
            return d.value;
        }) ]).range(colors);
        chart.renderArea.selectAll(".categoryLabel").data(categories).enter().append("text").text(function(d) {
            return d;
        }).attr("x", 0).attr("y", function(d, i) {
            return i * cellHeight;
        }).style("text-anchor", "end").attr("transform", "translate(-6," + cellHeight / 2 + ")").attr("class", function(d, i) {
            return i >= 0 && i <= 4 ? "categoryLabel mono axis axis-category" : "categoryLabel mono axis";
        });
        var dateFormat = d3.time.format("%b %Y");
        chart.renderArea.selectAll(".timeLabel").data(dates).enter().append("text").text(function(d) {
            return dateFormat(new Date(d));
        }).attr("x", 0).attr("y", function(d, i) {
            return i * cellWidth;
        }).style("text-anchor", "middle").attr("transform", "rotate(-90) translate(30, " + cellWidth / 2 + ")").attr("class", function(d, i) {
            return i >= 7 && i <= 16 ? "timeLabel mono axis axis-date" : "timeLabel mono axis";
        });
        var heatMap = chart.renderArea.selectAll("rect").data(data).enter().append("rect").attr("x", function(d, i) {
            return xCellScale(i % dates.length);
        }).attr("y", function(d) {
            return yCellScale(d.category);
        }).attr("width", cellWidth).attr("height", cellHeight).style("fill", function(d) {
            return chart.colors(d.value);
        });
        heatMap.append("title").text(function(d) {
            return d.value;
        });
        return this;
    };
    HeatMapBase.prototype.renderLegend = function() {
        var chart = this.chart;
        var config = this.config;
        var buckets = this.buckets;
        var cellHeight = this.cellHeight;
        var colors = this.colors;
        var legendElementWidth = Math.floor(config.paddedWidth() / buckets);
        var legend = chart.renderArea.append("g").attr("class", "legend");
        var legendItems = legend.selectAll(".legend-item").data([ 0 ].concat(chart.colors.quantiles()), function(d) {
            return d;
        }).enter().append("g").attr("class", "legend-item");
        legendItems.append("rect").attr("x", function(d, i) {
            return legendElementWidth * i;
        }).attr("y", config.paddedHeight() + 10).attr("width", legendElementWidth).attr("height", cellHeight / 2).style("fill", function(d, i) {
            return colors[i];
        });
        legendItems.append("text").text(function(d) {
            return "≥ " + Math.round(d);
        }).attr("x", function(d, i) {
            return legendElementWidth * i;
        }).attr("y", config.paddedHeight() + cellHeight + 2);
        return this;
    };
    HeatMapBase.prototype.render = function() {
        this.renderRectangles();
        this.renderLegend();
        return this;
    };
    var heatMap = function(selection, data) {
        var heatMapBase = new HeatMapBase(selection, data).render();
        var update = heatMapBase.chart.update = function() {};
        return update;
    };
    "use strict";
    var line = function(selection, data) {
        selection = check.string(selection) ? d3.select(selection) : selection;
        var chart = new ChartBase(selection, "line");
        var config = chart.config;
        config.margin.bottom = 50;
        var parseDate = d3.time.format("%d-%b-%y").parse;
        var formatTime = d3.time.format("%e %B");
        function updateX() {
            chart.xScale = d3.time.scale().range([ 0, config.paddedWidth() ]);
            chart.xAxis = d3.svg.axis().scale(chart.xScale).orient("bottom");
        }
        updateX();
        function updateY() {
            chart.yScale = d3.scale.linear().range([ config.paddedHeight(), 0 ]);
            chart.yAxis = d3.svg.axis().scale(chart.yScale).orient("left");
        }
        updateY();
        var lineGenerator = d3.svg.line().x(function(d) {
            return chart.xScale(d.x);
        }).y(function(d) {
            return chart.yScale(d.y);
        });
        data.forEach(function(series) {
            series.data.forEach(function(d) {
                d.x = parseDate(d.x);
                d.y = +d.y;
            });
        });
        chart.xScale.domain([ d3.min(data, function(series) {
            return d3.min(series.data, function(d) {
                return d.x;
            });
        }), d3.max(data, function(series) {
            return d3.max(series.data, function(d) {
                return d.x;
            });
        }) ]);
        chart.yScale.domain([ d3.min(data, function(series) {
            return d3.min(series.data, function(d) {
                return d.y;
            });
        }), d3.max(data, function(series) {
            return d3.max(series.data, function(d) {
                return d.y;
            });
        }) ]);
        chart.renderArea.append("g").attr("class", "x axis").attr("transform", "translate(0," + config.paddedHeight() + ")").call(chart.xAxis).append("text").attr("class", "x label").attr("text-anchor", "middle").attr("x", config.paddedWidth() / 2).attr("y", 28).text("");
        chart.renderArea.append("g").attr("class", "y axis").call(chart.yAxis).append("text").attr("class", "y label").attr("transform", "rotate(-90)").attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1).attr("dy", "1em").style("text-anchor", "middle").text("");
        var series = chart.renderArea.selectAll("series").data(data).enter().append("g").attr("class", "series");
        var lines = series.append("path").attr("class", "line").attr("d", function(d) {
            return lineGenerator(d.data);
        }).style("stroke", function(d) {
            return chart.colors(d.name);
        });
        var hoverLineGroup = chart.renderArea.append("g").attr("class", "hover-line");
        var hoverLine = hoverLineGroup.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", config.paddedHeight());
        hoverLine.style("opacity", 0);
        var tooltipRectangleGroup = chart.renderArea.append("g").attr("class", "tooltip-rect-group");
        config.tooltipHtml = function(points) {
            var html = "";
            html += '<div class="diagrammatica-tooltip-content">';
            points.forEach(function(d) {
                html += '<svg height="10" width="10"><rect height="10" width="10" fill="' + chart.colors(d.name) + '"></rect></svg>';
                html += "<span> " + d.name + "</span> : " + formatTime(d.x) + " : " + d.y + "<br>";
            });
            html += "</div>";
            return html;
        };
        function renderTooltip(data) {
            hoverLine.attr("y2", config.paddedHeight());
            tooltipRectangleGroup.selectAll(".tooltip-rect").remove();
            var tooltipRectangleWidth = config.paddedWidth() / data.length;
            var tooltipRectangleOffset = tooltipRectangleWidth / 2;
            tooltipRectangleGroup.selectAll(".tooltip-rect").data(data[0].data).enter().append("rect").attr("height", config.paddedHeight()).attr("width", tooltipRectangleWidth).attr("opacity", 0).classed("tooltip-rect", true).classed("diagrammatica-tooltip-target", true).attr("x", function(d) {
                return chart.xScale(d.x) - tooltipRectangleOffset;
            }).on("mouseover", function(d) {
                hoverLine.attr("x1", chart.xScale(d.x)).attr("x2", chart.xScale(d.x)).style("opacity", 1);
                tooltip.transition().style("opacity", 1);
                var rectBox = this.getBoundingClientRect();
                var tooltipBox = tooltip.node().getBoundingClientRect();
                var xPosition = rectBox.left + rectBox.width / 2;
                xPosition += d === data[0].data[data[0].data.length - 1] ? -Math.abs(tooltipBox.width + 10) : 10;
                var points = data.map(function(series) {
                    var point = series.data.filter(function(datum) {
                        return datum.x.getTime() === d.x.getTime();
                    });
                    var seriesPoint = point.length === 1 ? point[0] : {};
                    seriesPoint.name = series.name;
                    return seriesPoint;
                });
                tooltip.html(config.tooltipHtml(points)).style("left", xPosition + "px").style("top", d3.event.pageY + "px");
            }).on("mousemove", function() {
                tooltip.style("top", d3.event.pageY + "px");
            }).on("mouseout", function() {
                hoverLine.style("opacity", 0);
                tooltip.style("opacity", 0);
            });
        }
        renderTooltip(data);
        var legendGroup = chart.renderArea.append("g").attr("class", "legend");
        function renderLegend(data) {
            var legendItemData = data.map(function(d) {
                return {
                    name: d.name
                };
            });
            var selectedLegendItem;
            var legendItems = legendGroup.selectAll("g").data(legendItemData).enter().append("g").attr("class", "legend-item").on("mouseover", function(d) {
                legendItems.transition().attr("opacity", function(t) {
                    return d === t ? 1 : .3;
                });
                lines.transition().attr("opacity", function(t) {
                    return d.name === t.name ? 1 : 0;
                });
            }).on("mouseout", function() {
                if (check.object(selectedLegendItem)) {
                    legendItems.transition().attr("opacity", function(t) {
                        return t === selectedLegendItem ? 1 : .3;
                    });
                    lines.transition().attr("opacity", function(t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    legendItems.transition().attr("opacity", 1);
                    lines.transition().attr("opacity", 1);
                }
            }).on("click", function(d) {
                selectedLegendItem = selectedLegendItem === d ? null : d;
                if (check.object(selectedLegendItem)) {
                    lines.attr("opacity", function(t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    lines.attr("opacity", 1);
                }
            });
            legendItems.append("text").text(function(d) {
                return d.name;
            }).each(function(d) {
                d.width = this.getBBox().width;
            });
            legendItems.append("rect").attr("class", "legend-item-swatch").attr("height", 10).attr("width", 10).attr("x", -12).attr("y", -10).attr("fill", function(d) {
                return chart.colors(d.name);
            });
            var xOffset = 0;
            legendItems.attr("transform", function(d, i) {
                xOffset += i > 0 ? legendItemData[i - 1].width + 20 : 0;
                return "translate(" + xOffset + ",0)";
            });
            if (!chart.hasRenderedOnce) {
                legendGroup.attr("transform", "translate(" + [ (config.paddedWidth() - legendGroup.node().getBBox().width) / 2, config.height - 25 ].join() + ")");
            } else {
                legendGroup.transition().duration(1e3).attr("transform", "translate(" + [ (config.paddedWidth() - legendGroup.node().getBBox().width) / 2, config.height - 25 ].join() + ")");
            }
        }
        renderLegend(data);
        function update(data) {
            data.forEach(function(series) {
                series.data.forEach(function(d) {
                    d.x = parseDate(d.x);
                    d.y = +d.y;
                });
            });
            chart.xScale.domain([ d3.min(data, function(series) {
                return d3.min(series.data, function(d) {
                    return d.x;
                });
            }), d3.max(data, function(series) {
                return d3.max(series.data, function(d) {
                    return d.x;
                });
            }) ]);
            chart.yScale.domain([ d3.min(data, function(series) {
                return d3.min(series.data, function(d) {
                    return d.y;
                });
            }), d3.max(data, function(series) {
                return d3.max(series.data, function(d) {
                    return d.y;
                });
            }) ]);
            series = series.data(data);
            series.exit().remove();
            series.enter().append("g").attr("class", "series").append("path").attr("d", function(d) {
                return lineGenerator(d.data);
            }).style("stroke", function(d) {
                return chart.colors(d.name);
            }).attr("class", "line");
            series.select("path").transition().duration(1e3).attr("d", function(d) {
                return lineGenerator(d.data);
            }).style("stroke", function(d) {
                return chart.colors(d.name);
            });
            chart.renderArea.select(".x.axis").transition().duration(1e3).call(chart.xAxis).attr("transform", "translate(0," + config.paddedHeight() + ")");
            chart.renderArea.select(".y.axis").transition().duration(1e3).call(chart.yAxis);
            renderTooltip(data);
            renderLegend(data);
        }
        chart.update = update;
        update.width = function(value) {
            return chart.width(value, function() {
                updateX();
                selection.select(".x.axis .label").transition().duration(1e3).attr("x", config.paddedWidth() / 2).attr("y", 28);
            });
        };
        update.height = function(value) {
            return chart.height(value, function() {
                updateY();
                selection.select(".y.axis .label").transition().duration(1e3).attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1);
            });
        };
        update.yAxisLabelText = function(value) {
            return chart.yAxisLabelText(value);
        };
        update.xAxisLabelText = function(value) {
            return chart.xAxisLabelText(value);
        };
        update.tooltipHtml = function(value) {
            return chart.tooltipHtml(value);
        };
        chart.hasRenderedOnce = true;
        return update;
    };
    "use strict";
    var pie = function(selection, data) {
        selection = check.string(selection) ? d3.select(selection) : selection;
        var chart = new ChartBase(selection, "pie");
        var config = chart.config;
        chart.updateDimensions = function() {
            this.svg.attr("width", config.width).attr("height", config.height);
            chart.renderArea.attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")");
        };
        chart.updateDimensions();
        function outerRadius() {
            var outerRadiusMargin = -10;
            return Math.min(config.width, config.height) / 2 + outerRadiusMargin;
        }
        var arc = d3.svg.arc().innerRadius(0);
        var pie = d3.layout.pie().sort(null).value(function(d) {
            return d.population;
        });
        var updateRadius = function() {
            arc.outerRadius(outerRadius());
        };
        updateRadius();
        data.forEach(function(d) {
            d.population = +d.population;
        });
        var paths = chart.renderArea.selectAll("path").data(pie(data)).enter().append("path").attr("d", arc).style("fill", function(d) {
            return chart.colors(d.data.age);
        }).each(function(d) {
            this.currentAngle = d;
        });
        var labels = chart.renderArea.selectAll("text").data(pie(data)).enter().append("text").attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        }).attr("dy", ".35em").style("text-anchor", "middle").text(function(d) {
            return d.data.age;
        });
        var arcTween = function(a) {
            var i = d3.interpolate(this.currentAngle, a);
            this.currentAngle = i(0);
            return function(t) {
                return arc(i(t));
            };
        };
        function update(newData) {
            data = check.defined(newData) ? newData : data;
            data.forEach(function(d) {
                d.population = +d.population;
            });
            paths.data(pie(data)).transition().duration(500).attrTween("d", arcTween);
            labels.data(pie(data)).transition().duration(500).attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            }).attr("dy", ".35em").style("text-anchor", "middle").text(function(d) {
                return d.data.age;
            });
        }
        chart.update = update;
        update.width = function(value) {
            return chart.width(value, updateRadius);
        };
        update.height = function(value) {
            return chart.height(value, updateRadius);
        };
        return update;
    };
    "use strict";
    var tooltip = d3.select("body").append("div").attr("class", "diagrammatica-tooltip").style("opacity", 0);
    document.addEventListener("mousemove", function(event) {
        if (!d3.select(event.toElement).classed("diagrammatica-tooltip-target")) {
            tooltip.style("opacity", 0);
        }
    });
    exports["BarBase"] = BarBase;
    exports["bar"] = bar;
    exports["ChartBase"] = ChartBase;
    exports["scrollPosition"] = scrollPosition;
    exports["HeatMapBase"] = HeatMapBase;
    exports["heatMap"] = heatMap;
    exports["line"] = line;
    exports["pie"] = pie;
    exports["tooltip"] = tooltip;
})({}, function() {
    return this;
}());