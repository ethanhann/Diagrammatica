(function(exports, global) {
    global["diagrammatica"] = exports;
    "use strict";
    var bar = function(selection, data) {
        selection = check.string(selection) ? d3.select(selection) : selection;
        var chart = new ChartBase(selection, "bar");
        var config = chart.config;
        chart.height(150);
        function updateX() {
            chart.xScale = d3.scale.ordinal().domain(data.map(function(d) {
                return d.name;
            })).rangeRoundBands([ 0, config.paddedHeight() ], .1);
            chart.xAxis = d3.svg.axis().scale(chart.xScale).orient("left");
        }
        updateX();
        function updateY() {
            chart.yScale = d3.scale.linear().domain([ 0, d3.max(data, function(d) {
                return d.value;
            }) ]).range([ 0, config.paddedWidth() ]);
            chart.yAxis = d3.svg.axis().scale(chart.yScale).orient("bottom");
        }
        updateY();
        chart.renderArea.append("g").attr("class", "x axis").call(chart.xAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1).attr("dy", "1em").style("text-anchor", "middle").text("");
        chart.renderArea.append("g").attr("class", "y axis").attr("transform", "translate(0," + config.paddedHeight() + ")").call(chart.yAxis).append("text").attr("class", "label").attr("text-anchor", "middle").attr("x", config.paddedWidth() / 2).attr("y", 28).text("");
        var bars = chart.renderArea.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar diagrammatica-tooltip-target").attr("x", 0).attr("y", function(d) {
            return chart.xScale(d.name);
        }).attr("width", function(d) {
            return chart.yScale(d.value);
        }).attr("height", chart.xScale.rangeBand()).attr("fill", function(d) {
            return chart.colors(d.value);
        });
        config.tooltipHtml = function(d) {
            return '<div class="left-arrow"></div><div class="diagrammatica-tooltip-content">' + d.value + "</div>";
        };
        bars.on("mouseover", function(d) {
            tooltip.transition().style("opacity", 1);
            var parentBox = this.getBoundingClientRect();
            var tooltipBox = tooltip.node().getBoundingClientRect();
            var boxHeightOffset = (parentBox.height - tooltipBox.height) / 2;
            tooltip.html(config.tooltipHtml(d)).style("left", parentBox.right + "px").style("top", parentBox.top + scrollPosition().y + boxHeightOffset + "px");
        }).on("mouseout", function() {
            tooltip.style("opacity", 0);
        });
        function update(newData) {
            data = check.defined(newData) ? newData : data;
            updateY();
            chart.renderArea.select(".y.axis").transition().duration(1e3).call(chart.yAxis).attr("transform", "translate(0," + config.paddedHeight() + ")");
            updateX();
            chart.renderArea.select(".x.axis").transition().duration(1e3).call(chart.xAxis);
            chart.renderArea.selectAll(".bar").data(data).transition().delay(function(d, i) {
                return i * 100;
            }).duration(500).ease("linear").attr("y", function(d) {
                return chart.xScale(d.name);
            }).attr("width", function(d) {
                return chart.yScale(d.value);
            }).attr("height", chart.xScale.rangeBand());
        }
        chart.update = update;
        update.width = function(value) {
            return chart.width(value, function() {
                updateY();
                selection.select(".y.axis .label").transition().duration(1e3).attr("x", config.paddedWidth() / 2).attr("y", 28);
            });
        };
        update.height = function(value) {
            return chart.height(value, function() {
                updateX();
                selection.select(".x.axis .label").transition().duration(1e3).attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1);
            });
        };
        update.yAxisLabelText = function(value) {
            return chart.yAxisLabelText(value);
        };
        update.xAxisLabelText = function(value) {
            return chart.xAxisLabelText(value);
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
    ChartBase.prototype = {
        axisLabelText: function(axisLetter, value) {
            var label = this.selection.select("." + axisLetter + ".axis .label");
            if (check.not.defined(value)) {
                return label.empty() ? "" : label.text();
            }
            label.text(value);
            return this.update;
        },
        yAxisLabelText: function(value) {
            return this.axisLabelText("y", value);
        },
        xAxisLabelText: function(value) {
            return this.axisLabelText("x", value);
        },
        width: function(value, axisUpdateCallback) {
            if (!arguments.length) {
                return this.config.width;
            }
            this.config.width = value;
            if (check.defined(axisUpdateCallback)) {
                axisUpdateCallback();
            }
            this.svg.attr("width", this.config.width);
            this.updateDimensions();
            return this.update;
        },
        height: function(value, axisUpdateCallback) {
            if (!arguments.length) {
                return this.config.height;
            }
            this.config.height = value;
            if (check.defined(axisUpdateCallback)) {
                axisUpdateCallback();
            }
            this.svg.attr("height", this.config.height);
            this.updateDimensions();
            return this.update;
        },
        tooltipHtml: function(value) {
            if (!arguments.length) {
                return this.config.tooltipHtml();
            }
            this.config.tooltipHtml = value;
            return this.update;
        }
    };
    "use strict";
    var column = function(selection, data) {
        selection = check.string(selection) ? d3.select(selection) : selection;
        var chart = new ChartBase(selection, "column");
        var config = chart.config;
        function updateX() {
            chart.xScale = d3.scale.ordinal().domain(data.map(function(d) {
                return d.name;
            })).rangeRoundBands([ 0, config.paddedHeight() ], .1);
            chart.xAxis = d3.svg.axis().scale(chart.xScale).orient("bottom");
        }
        updateX();
        function updateY() {
            chart.yScale = d3.scale.linear().domain([ 0, d3.max(data, function(d) {
                return d.value;
            }) ]).range([ config.paddedHeight(), 0 ]);
            chart.yAxis = d3.svg.axis().scale(chart.yScale).orient("left");
        }
        updateY();
        chart.renderArea.append("g").attr("class", "x axis").attr("transform", "translate(0," + config.paddedHeight() + ")").call(chart.xAxis).append("text").attr("class", "x label").attr("text-anchor", "middle").attr("x", config.paddedWidth() / 2).attr("y", 28).text("");
        chart.renderArea.append("g").attr("class", "y axis").call(chart.yAxis).append("text").attr("class", "y label").attr("transform", "rotate(-90)").attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1).attr("dy", "1em").style("text-anchor", "middle").text("");
        chart.renderArea.selectAll(".column").data(data).enter().append("rect").attr("class", "column").attr("x", function(d) {
            return chart.xScale(d.name);
        }).attr("y", function(d) {
            return chart.yScale(d.value);
        }).attr("width", chart.xScale.rangeBand()).attr("height", function(d) {
            return config.paddedHeight() - chart.yScale(d.value);
        }).attr("fill", function(d) {
            return chart.colors(d.value);
        });
        function update(newData) {
            data = check.defined(newData) ? newData : data;
            updateY();
            chart.renderArea.select(".y.axis").transition().duration(1e3).call(chart.yAxis);
            updateX();
            chart.renderArea.select(".x.axis").transition().duration(1e3).call(chart.xAxis).attr("transform", "translate(0," + config.paddedHeight() + ")");
            chart.renderArea.selectAll(".column").data(data).transition().duration(1e3).ease("linear").attr("x", function(d) {
                return chart.xScale(d.name);
            }).attr("y", function(d) {
                return chart.yScale(d.value);
            }).attr("width", chart.xScale.rangeBand()).attr("height", function(d) {
                return config.paddedHeight() - chart.yScale(d.value);
            });
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
        return update;
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
    var heatMap = function(selection, data) {
        selection = check.string(selection) ? d3.select(selection) : selection;
        var chart = new ChartBase(selection, "heat-map");
        var config = chart.config;
        chart.config.margin.top = 55;
        chart.config.margin.bottom = 40;
        chart.config.margin.left = 50;
        chart.updateDimensions();
        var dates = d3.set(data.map(function(d) {
            return d.date;
        })).values();
        var cellWidth = Math.floor(config.paddedWidth() / dates.length);
        var categories = d3.set(data.map(function(d) {
            return d.category;
        })).values();
        var cellHeight = Math.floor(config.paddedHeight() / categories.length);
        var buckets = 9;
        var colors = colorbrewer.OrRd[buckets];
        var legendElementWidth = Math.floor(config.paddedWidth() / buckets);
        var xCellScale = d3.scale.linear().domain([ 0, dates.length - 1 ]).range([ 0, config.paddedWidth() - cellWidth ]);
        var yCellScale = d3.scale.ordinal().domain(data.map(function(d) {
            return d.category;
        })).rangeRoundBands([ 0, config.paddedHeight() + 3 ]);
        var colorScale = d3.scale.quantile().domain([ 0, buckets - 1, d3.max(data, function(d) {
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
        }).attr("width", cellWidth).attr("height", cellHeight).style("fill", colors[0]);
        heatMap.transition().duration(1e3).style("fill", function(d) {
            return colorScale(d.value);
        });
        heatMap.append("title").text(function(d) {
            return d.value;
        });
        var legend = chart.renderArea.append("g").attr("class", "legend");
        var legendItems = legend.selectAll(".legend-item").data([ 0 ].concat(colorScale.quantiles()), function(d) {
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
        var update = function() {};
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
            points.forEach(function(d) {
                html += '<svg height="10" width="10"><rect height="10" width="10" fill="' + chart.colors(d.name) + '"></rect></svg>';
                html += "<span> " + d.name + "</span> : " + formatTime(d.x) + " : " + d.y + "<br>";
            });
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
    var tooltip = d3.select("body").append("div").attr("class", "diagrammatica-tooltip diagrammatica-tooltip-content").style("opacity", 0);
    document.addEventListener("mousemove", function(event) {
        if (!d3.select(event.toElement).classed("diagrammatica-tooltip-target")) {
            tooltip.style("opacity", 0);
        }
    });
    exports["bar"] = bar;
    exports["ChartBase"] = ChartBase;
    exports["column"] = column;
    exports["scrollPosition"] = scrollPosition;
    exports["heatMap"] = heatMap;
    exports["line"] = line;
    exports["pie"] = pie;
    exports["tooltip"] = tooltip;
})({}, function() {
    return this;
}());