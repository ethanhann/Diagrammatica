(function(exports, global) {
    global["diagrammatica"] = exports;
    "use strict";
    var BarBase = function(selection, data, orientation) {
        selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
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
        this.selection = isD3Selection(selection) ? selection : d3.select(selection);
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
            var paddedHeight = config.height - config.margin.top - config.margin.bottom;
            if (paddedHeight <= 0) {
                throw "Padded height (" + paddedHeight + ") of chart should be greater than 0. Increase its height or decrease its top/bottom margin.";
            }
            return paddedHeight;
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
        var standardColors = [ "#FD7C6E", "#87A96B", "#78DBE2", "#1F75FE", "#A2A2D0", "#6699CC", "#0D98BA", "#7366BD", "#CD9575", "#FFA474", "#FAE7B5", "#9F8170", "#ACE5EE", "#DE5D83", "#CB4154", "#B4674D", "#FF7F49", "#EA7E5D", "#B0B7C6", "#FFFF99", "#00CC99", "#FFAACC", "#DD4492", "#1DACD6", "#BC5D58", "#DD9475", "#9ACEEB", "#FFBCD9", "#FDDB6D", "#2B6CC4", "#EFCDB8", "#6E5160", "#CEFF1D", "#71BC78", "#6DAE81", "#C364C5", "#CC6666", "#E7C697", "#FCD975", "#A8E4A0", "#95918C", "#1CAC78", "#1164B4", "#F0E891", "#FF1DCE", "#B2EC5D", "#5D76CB", "#CA3767", "#3BB08F", "#FEFE22", "#FCB4D5", "#FFF44F", "#FFBD88", "#F664AF", "#AAF0D1", "#CD4A4C", "#EDD19C", "#979AAA", "#FF8243", "#C8385A", "#EF98AA", "#FDBCB4", "#1A4876", "#30BA8F", "#C54B8C", "#1974D2", "#FFA343", "#BAB86C", "#FF7538", "#FF2B2B", "#F8D568", "#E6A8D7", "#414A4C", "#FF6E4A", "#1CA9C9", "#FFCFAB", "#C5D0E6", "#FDDDE6", "#158078", "#FC74FD", "#F78FA7", "#8E4585", "#7442C8", "#9D81BA", "#FE4EDA", "#FF496C", "#D68A59", "#714B23", "#FF48D0", "#E3256B", "#EE204D", "#FF5349", "#C0448F", "#1FCECB", "#7851A9", "#FF9BAA", "#FC2847", "#76FF7A", "#93DFB8", "#A5694F", "#8A795D", "#45CEA2", "#FB7EFD", "#CDC5C2", "#80DAEB", "#ECEABE", "#FFCF48", "#FD5E53", "#FAA76C", "#18A7B5", "#EBC7DF", "#FC89AC", "#DBD7D2", "#17806D", "#DEAA88", "#77DDE7", "#FFFF66", "#926EAE", "#324AB2", "#F75394", "#FFA089", "#8F509D", "#FFFFFF", "#A2ADD0", "#FF43A4", "#FC6C85", "#CDA4DE", "#FCE883", "#C5E384", "#FFAE42", "#EFDECD", "#000000" ];
        this.colors = d3.scale.ordinal().range(standardColors);
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
    function isD3Selection(value) {
        return value instanceof d3.selection || check.array(value) && typeof value[0] !== "string";
    }
    "use strict";
    var toCSV = function(json, reportTitle, showHeader) {
        var arrData = check.object(json) ? JSON.parse(json) : json;
        var csv = showHeader ? Object.keys(arrData[0]).join() + "\r\n" : "";
        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            for (var j in arrData[i]) {
                if (arrData[i].hasOwnProperty(j)) {
                    row += '"' + arrData[i][j] + '",';
                }
            }
            row.slice(0, row.length - 1);
            csv += row + "\r\n";
        }
        var fileName = "export";
        if (check.string(reportTitle)) {
            fileName = reportTitle.replace(/ /g, "_");
        }
        var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        var link = document.createElement("a");
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    "use strict";
    var HeatMapBase = function(selection, data) {
        this.data = data;
        selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
        var chart = this.chart = new ChartBase(selection, "heat-map");
        var config = this.config = chart.config;
        config.margin.top = 55;
        config.margin.bottom = 40;
        config.margin.right = 0;
        chart.updateDimensions();
        var dateRange = this.dateRange();
        this.fromX = moment(dateRange.from).toDate();
        this.toX = moment(dateRange.to).toDate();
    };
    HeatMapBase.prototype.filterDataByDateRange = function(data, unit) {
        var self = this;
        return data.filter(function(d) {
            var m = moment(new Date(d.date));
            return (m.isAfter(self.fromX, unit) || m.isSame(self.fromX, unit)) && m.isBefore(self.toX, unit) || m.isSame(self.toX, unit);
        });
    };
    HeatMapBase.prototype.getDates = function(data, unit) {
        var self = this;
        var dates = data.map(function(d) {
            return d.date;
        });
        return d3.set(dates).values().filter(function(d) {
            var m = moment(new Date(d));
            return (m.isAfter(self.fromX, unit) || m.isSame(self.fromX, unit)) && m.isBefore(self.toX, unit) || m.isSame(self.toX, unit);
        });
    };
    HeatMapBase.prototype.dateRange = function() {
        var r = d3.extent(this.data.map(function(d) {
            return d.date;
        }));
        return {
            from: r[0],
            to: r[1]
        };
    };
    HeatMapBase.prototype.displayDateUnit = function() {
        return moment(this.toX).diff(this.fromX, "months") >= 24 ? "year" : "month";
    };
    HeatMapBase.prototype.prepareDisplayData = function() {
        this.displayData = {
            data: this.filterDataByDateRange(this.data, "month"),
            dateFormat: d3.time.format("%b %Y"),
            dates: this.getDates(this.data, "month")
        };
        var dateUnit = this.displayDateUnit();
        if (dateUnit === "year") {
            var x = d3.nest().key(function(d) {
                return d.category;
            }).key(function(d) {
                return new Date(d.date).getFullYear();
            }).entries(this.data);
            var yearData = [];
            x.forEach(function(c) {
                c.values.forEach(function(s) {
                    var date = moment(s.key, "YYYY").toDate();
                    yearData.push({
                        category: c.key,
                        date: date,
                        value: d3.sum(s.values, function(d) {
                            return d.value;
                        })
                    });
                });
            });
            this.displayData.data = this.filterDataByDateRange(yearData, "year");
            this.displayData.dates = this.getDates(yearData, "year");
            this.displayData.dateFormat = d3.time.format("%Y");
        }
    };
    HeatMapBase.prototype.preRender = function() {
        var displayData = this.displayData;
        var chart = this.chart;
        var config = this.chart.config;
        this.updateCellPrimitives = function(data) {
            this.cellWidth = Math.floor(config.paddedWidth() / displayData.dates.length);
            this.categories = d3.set(data.map(function(d) {
                return d.category;
            })).values();
            this.cellHeight = Math.floor(config.paddedHeight() / this.categories.length);
        };
        this.updateCellPrimitives(displayData.data);
        this.colors = [ "#F7F9F5", "#F0F4EC", "#E1E9DA", "#D2DEC7", "#C3D4B5", "#B4C9A2", "#A5BE90", "#96B37D", "#87A96B" ];
        this.buckets = this.colors.length;
        chart.xScale = d3.scale.linear();
        chart.yScale = d3.scale.ordinal();
        chart.colorScale = d3.scale.quantile();
        this.updateX = function(data) {
            this.updateCellPrimitives(data);
            chart.xScale.domain([ 0, displayData.dates.length - 1 ]).range([ 0, config.paddedWidth() - this.cellWidth ]);
        };
        this.updateY = function(data) {
            chart.yScale.domain(data.map(function(d) {
                return d.category;
            })).rangeRoundBands([ 0, config.paddedHeight() + 3 ]);
        };
        this.updateColors = function(data) {
            chart.colorScale.domain([ 0, this.buckets - 1, d3.max(data, function(d) {
                return d.value;
            }) ]).range(this.colors);
        };
        this.updateX(displayData.data);
        this.updateY(displayData.data);
        this.updateColors(displayData.data);
    };
    HeatMapBase.prototype.renderRectangles = function() {
        var chart = this.chart;
        var cellHeight = this.cellHeight;
        var cellWidth = this.cellWidth;
        var categories = this.categories;
        var displayData = this.displayData;
        var labelPadding = 6;
        this.yLabels = chart.renderArea.selectAll(".yLabel").data(categories).enter().append("text").text(function(d) {
            return d;
        }).attr("x", -labelPadding / 2).style("text-anchor", "end").attr("class", "axis yLabel");
        if (!this.yLabels.empty()) {
            var maxYLabelHeight = d3.max(this.yLabels[0], function(d) {
                return d.getBoundingClientRect().height;
            });
            this.yLabels.attr("y", function(d) {
                return chart.yScale(d) + cellHeight / 2 + maxYLabelHeight / 4;
            });
            chart.config.margin.left = labelPadding + d3.max(this.yLabels[0], function(d) {
                return d.getBoundingClientRect().width;
            });
            chart.updateDimensions();
        }
        this.xLabels = chart.renderArea.selectAll(".xLabel").data(displayData.dates).enter().append("text").text(function(d) {
            return displayData.dateFormat(new Date(d));
        }).attr("x", 0).style("text-anchor", "middle").attr("transform", "rotate(-90) translate(30, 0)").attr("class", "axis xLabel");
        if (!this.xLabels.empty()) {
            var maxXLabelHeight = d3.max(this.xLabels[0], function(d) {
                return d.getBoundingClientRect().height;
            });
            this.xLabels.attr("y", function(d, i) {
                return chart.xScale(i % displayData.dates.length) + cellWidth / 2 + maxXLabelHeight / 8;
            });
        }
        this.rectGroups = chart.renderArea.selectAll("g").data(displayData.data).enter().append("g").attr("transform", function(d, i) {
            var x = chart.xScale(i % displayData.dates.length);
            var y = chart.yScale(d.category);
            return "translate(" + x + "," + y + ")";
        });
        this.rectGroups.append("rect").attr("width", cellWidth).attr("height", cellHeight).style("fill", function(d) {
            return chart.colorScale(d.value);
        });
        this.rectGroups.append("text").text(function(d) {
            return d.value;
        }).attr("x", cellWidth / 2).attr("y", cellHeight / 2).attr("alignment-baseline", "middle").attr("text-anchor", "middle");
        return this;
    };
    HeatMapBase.prototype.renderLegend = function() {
        var chart = this.chart;
        var config = this.config;
        var buckets = this.buckets;
        var colors = this.colors;
        var legendElementWidth = Math.floor(config.paddedWidth() / buckets);
        var legend = this.legend = chart.renderArea.append("g").attr("class", "legend");
        var legendItems = legend.selectAll(".legend-item").data([ 0 ].concat(chart.colorScale.quantiles()), function(d) {
            return d;
        }).enter().append("g").attr("class", "legend-item");
        var swatchHeight = 19;
        legendItems.append("rect").attr("x", function(d, i) {
            return legendElementWidth * i;
        }).attr("y", config.paddedHeight() + 10).attr("width", legendElementWidth).attr("height", swatchHeight).style("fill", function(d, i) {
            return colors[i];
        });
        legendItems.append("text").text(function(d) {
            return "≥ " + Math.round(d);
        }).attr("x", function(d, i) {
            return legendElementWidth * i;
        }).attr("y", config.paddedHeight() + swatchHeight * 2 + 2);
        return this;
    };
    HeatMapBase.prototype.render = function() {
        this.prepareDisplayData();
        this.preRender();
        this.renderRectangles();
        this.renderLegend();
        return this;
    };
    var heatMap = function(selection, data) {
        var heatMapBase = new HeatMapBase(selection, data).render();
        var chart = heatMapBase.chart;
        var update = heatMapBase.chart.update = function(newData) {
            data = heatMapBase.data = check.defined(newData) ? newData : heatMapBase.data;
            heatMapBase.prepareDisplayData();
            heatMapBase.updateColors(heatMapBase.displayData.data);
            heatMapBase.updateX(heatMapBase.displayData.data);
            heatMapBase.updateY(heatMapBase.displayData.data);
            heatMapBase.xLabels.remove();
            heatMapBase.yLabels.remove();
            heatMapBase.rectGroups.remove();
            heatMapBase.legend.remove();
            heatMapBase.render();
        };
        update.width = function(value) {
            return chart.width(value, function() {
                heatMapBase.updateY(heatMapBase.data);
            });
        };
        update.height = function(value) {
            return chart.height(value, function() {
                heatMapBase.updateX(heatMapBase.data);
            });
        };
        update.margin = function(value) {
            if (!check.defined(value)) {
                return chart.config.margin;
            }
            chart.config.margin = value;
            return update;
        };
        update.margin.left = function(value) {
            if (!check.defined(value)) {
                return chart.config.margin.left;
            }
            chart.config.margin.left = value;
            return update;
        };
        update.displayData = function() {
            return heatMapBase.displayData;
        };
        update.fromX = function(value) {
            if (!check.defined(value)) {
                return heatMapBase.fromX;
            }
            heatMapBase.fromX = value;
            return update;
        };
        update.toX = function(value) {
            if (!check.defined(value)) {
                return heatMapBase.toX;
            }
            heatMapBase.toX = value;
            return update;
        };
        return update;
    };
    "use strict";
    var line = function(selection, data) {
        var self = this;
        self.data = data;
        selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
        var chart = new ChartBase(selection, "line");
        var config = chart.config;
        config.margin.bottom = 100;
        config.margin.top = 25;
        var brushData = {
            chart: {}
        };
        brushData.config = {
            margin: {
                top: function() {
                    return config.paddedHeight() + 45;
                },
                right: config.margin.right,
                bottom: 10,
                left: config.margin.left
            },
            height: function() {
                return config.height - brushData.config.margin.top() - brushData.config.margin.bottom;
            }
        };
        config.dotSize = 3;
        var formatTextTime = d3.time.format("%B %Y");
        function updateX() {
            chart.xScale = d3.time.scale().range([ 0, config.paddedWidth() ]);
            chart.xAxis = d3.svg.axis().scale(chart.xScale).orient("bottom");
            brushData.chart.xScale = d3.time.scale().range([ 0, config.paddedWidth() ]);
            brushData.chart.xAxis = d3.svg.axis().scale(brushData.chart.xScale).orient("bottom");
        }
        updateX();
        function updateY() {
            chart.yScale = d3.scale.linear().range([ config.paddedHeight(), 0 ]);
            brushData.chart.yScale = d3.scale.linear().range([ brushData.config.height(), 0 ]).domain([ 0, d3.max(data, function(series) {
                return d3.max(series.data, function(d) {
                    return d.y;
                });
            }) ]);
            chart.yAxis = d3.svg.axis().scale(chart.yScale).orient("left");
        }
        updateY();
        function brushed() {
            chart.xScale.domain(brushData.brush.empty() ? brushData.chart.xScale.domain() : brushData.brush.extent());
            series.selectAll("path").attr("d", function(d1) {
                return lineGenerator(d1.data);
            });
            chart.renderArea.select(".x.axis").call(chart.xAxis);
            series.selectAll(".dots").attr("cx", function(d) {
                return chart.xScale(d.x);
            });
            renderTooltip(data);
            sendBrushData();
        }
        function dateRange() {
            var from = moment(brushData.westDate);
            var to = moment(brushData.eastDate);
            var dateDiff = moment(to.diff(from));
            var numOfYears = dateDiff.diff(moment(0), "years");
            var numOfYMonths = dateDiff.diff(moment(0), "months") - numOfYears * 12;
            return numOfYears + " year(s), " + numOfYMonths + " month(s)";
        }
        function sendBrushData() {
            var evt = document.createEvent("CustomEvent");
            brushData.westDate = brushData.brush.extent()[0];
            brushData.eastDate = brushData.brush.extent()[1];
            brushData.range.select("#fromDate").text(formatTextTime(brushData.westDate)).transition().duration(1e3);
            brushData.range.select("#toDate").text(formatTextTime(brushData.eastDate)).transition().duration(1e3).attr("transform", "translate(" + config.paddedWidth() + ",-5)");
            brushData.range.select("#range").transition().duration(1e3).text(dateRange()).attr("transform", "translate(" + config.paddedWidth() / 2 + ",-5)");
            evt.initCustomEvent("brushEvent", true, true, {
                fromDate: brushData.westDate,
                toDate: brushData.eastDate,
                data: data
            });
            document.dispatchEvent(evt);
        }
        var lineGenerator = d3.svg.line().x(function(d) {
            return chart.xScale(d.x);
        }).y(function(d) {
            return chart.yScale(d.y);
        });
        var brushLineGenerator = d3.svg.line().x(function(d) {
            return chart.xScale(d.x);
        }).y(function(d) {
            return brushData.chart.yScale(d.y * .9);
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
        brushData.chart.xScale.domain(chart.xScale.domain());
        brushData.brush = d3.svg.brush().x(brushData.chart.xScale).on("brush", brushed).extent([ d3.min(data, function(series) {
            return d3.min(series.data, function(d) {
                return d.x;
            });
        }), d3.max(data, function(series) {
            return d3.max(series.data, function(d) {
                return d.x;
            });
        }) ]);
        brushData.westDate = brushData.brush.extent()[0];
        brushData.eastDate = brushData.brush.extent()[1];
        brushData.uniqueClipId = "clip" + (brushData.eastDate - brushData.westDate);
        brushData.range = chart.renderArea.append("g");
        brushData.range.append("text").attr("id", "fromDate").text(formatTextTime(brushData.westDate)).attr("transform", "translate(0,-5)").style("text-anchor", "start").style("font-weight", "bold");
        brushData.range.append("text").attr("id", "toDate").text(formatTextTime(brushData.eastDate)).attr("transform", "translate(0,-5)").style("text-anchor", "end").style("font-weight", "bold");
        brushData.range.append("text").attr("id", "range").text(dateRange()).attr("transform", "translate(0,-5)").style("text-anchor", "middle").style("font-weight", "bold");
        brushData.clipping = chart.renderArea.append("defs").append("clipPath").attr("id", brushData.uniqueClipId).append("rect").attr("transform", "translate(" + config.dotSize * -1 + "," + config.dotSize * -1 + ")").attr("width", config.paddedWidth() + config.dotSize * 2).attr("height", config.paddedHeight() + config.dotSize * 2);
        var focus = chart.renderArea.append("g").attr("class", "focus");
        focus.append("g").attr("class", "x axis").attr("transform", "translate(0," + config.paddedHeight() + ")").call(chart.xAxis).append("text").attr("class", "x label").attr("text-anchor", "middle").attr("x", config.paddedWidth() / 2).attr("y", 28).text("");
        focus.append("g").attr("class", "y axis").call(chart.yAxis).append("text").attr("class", "y label").attr("transform", "rotate(-90)").attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1).attr("dy", "1em").style("text-anchor", "middle").text("");
        var context = chart.renderArea.append("g").attr("class", "context").attr("transform", "translate(0," + brushData.config.height() + ")");
        var series = focus.selectAll("series").data(data).enter().append("g").attr("class", "series");
        var lines = series.append("path").attr("class", "line").attr("clip-path", "url(#" + brushData.uniqueClipId + ")").attr("d", function(d) {
            return lineGenerator(d.data);
        }).style("stroke", function(d) {
            return chart.colors(d.name);
        });
        var dots = series.selectAll("dots").data(function(d) {
            d.data.map(function(p) {
                p.name = d.name;
            });
            return d.data;
        }).enter().append("circle").classed("dots", true).attr("r", config.dotSize).attr("clip-path", "url(#" + brushData.uniqueClipId + ")").attr("cy", function(d) {
            return chart.yScale(d.y);
        }).attr("cx", function(d) {
            return chart.xScale(d.x);
        }).attr("fill", function(d) {
            return chart.colors(d.name);
        });
        brushData.series = context.selectAll("series").data(data).enter().append("g").attr("class", "series");
        brushData.series.append("path").attr("class", "line").attr("d", function(d) {
            return brushLineGenerator(d.data);
        }).style("stroke", function(d) {
            return chart.colors(d.name);
        });
        context.append("g").attr("class", "x axis").attr("transform", "translate(" + config.paddedWidth() * -1 + "," + brushData.config.height() + ")").call(brushData.chart.xAxis);
        context.append("g").attr("class", "x brush").call(brushData.brush).selectAll("rect").attr("height", brushData.config.height());
        context.selectAll(".resize").append("rect").attr("x", -3).attr("y", 0).attr("width", 6).attr("class", "handle");
        var hoverLineGroup = chart.renderArea.append("g").attr("class", "hover-line");
        var hoverLine = hoverLineGroup.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", config.paddedHeight());
        hoverLine.style("opacity", 0);
        var tooltipRectangleGroup = chart.renderArea.append("g").attr("class", "tooltip-rect-group");
        config.tooltipHtml = function(points) {
            var html = "";
            html += '<div class="diagrammatica-tooltip-content">';
            html += points.length > 0 ? '<div class="diagrammatica-tooltip-title">' + formatTextTime(points[0].x) + "</div>" : "";
            points.forEach(function(d) {
                html += '<svg height="10" width="10"><rect height="10" width="10" fill="' + chart.colors(d.name) + '"></rect></svg>';
                html += "<span> " + d.name + "</span> : " + d.y + "<br>";
            });
            html += "</div>";
            return html;
        };
        function renderTooltip(data) {
            hoverLine.attr("y2", config.paddedHeight());
            tooltipRectangleGroup.selectAll(".tooltip-rect").remove();
            var xValueSet = d3.set(data.map(function(d) {
                return d.data;
            }).reduce(function(a, b) {
                return a.concat(b);
            }).map(function(d) {
                return d.x;
            })).values().map(function(x) {
                return new Date(x);
            });
            var tooltipRectangleWidth = config.paddedWidth() / xValueSet.length;
            var tooltipRectangleOffset = tooltipRectangleWidth / 2;
            tooltipRectangleGroup.selectAll(".tooltip-rect").data(xValueSet).enter().append("rect").attr("height", config.paddedHeight()).attr("width", tooltipRectangleWidth).attr("opacity", 0).attr("clip-path", "url(#" + brushData.uniqueClipId + ")").classed("tooltip-rect", true).classed("diagrammatica-tooltip-target", true).attr("x", function(x) {
                return chart.xScale(x) - tooltipRectangleOffset;
            }).on("mouseover", function(x) {
                hoverLine.attr("x1", chart.xScale(x)).attr("x2", chart.xScale(x)).attr("clip-path", "url(#" + brushData.uniqueClipId + ")").style("opacity", 1);
                tooltip.transition().style("opacity", 1);
                var rectBox = this.getBoundingClientRect();
                var tooltipBox = tooltip.node().getBoundingClientRect();
                var xPosition = rectBox.left + rectBox.width / 2;
                xPosition += x === xValueSet.length[xValueSet.length - 1] ? -Math.abs(tooltipBox.width + 10) : 10;
                var points = data.map(function(series) {
                    var point = series.data.filter(function(datum) {
                        return datum.x.toString() === x.toString();
                    });
                    var seriesPoint = point.length === 1 ? point[0] : {};
                    seriesPoint.name = series.name;
                    return seriesPoint;
                });
                dots.transition().attr("cy", function(d) {
                    return chart.yScale(d.y);
                }).attr("cx", function(d) {
                    return chart.xScale(d.x);
                }).attr("r", function(t) {
                    var grow = points.filter(function(d) {
                        return t === d;
                    });
                    return grow.length > 0 ? config.dotSize * 2 : config.dotSize;
                });
                tooltip.html(config.tooltipHtml(points)).style("left", xPosition + "px").style("top", d3.event.pageY + "px");
            }).on("mousemove", function() {
                tooltip.style("top", d3.event.pageY + "px");
            }).on("mouseout", function() {
                hoverLine.style("opacity", 0);
                tooltip.style("opacity", 0);
                dots.transition().attr("cy", function(d) {
                    return chart.yScale(d.y);
                }).attr("cx", function(d) {
                    return chart.xScale(d.x);
                }).attr("r", config.dotSize);
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
                dots.transition().attr("opacity", function(t) {
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
                    dots.transition().attr("opacity", function(t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    legendItems.transition().attr("opacity", 1);
                    lines.transition().attr("opacity", 1);
                    dots.transition().attr("opacity", 1);
                }
            }).on("click", function(d) {
                selectedLegendItem = selectedLegendItem === d ? null : d;
                if (check.object(selectedLegendItem)) {
                    lines.attr("opacity", function(t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                    dots.attr("opacity", function(t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                    renderTooltip(data.filter(function(l) {
                        return l.name === selectedLegendItem.name;
                    }));
                } else {
                    lines.attr("opacity", 1);
                    dots.attr("opacity", 1);
                    renderTooltip(data);
                }
            });
            legendItems.append("text").text(function(d) {
                return d.name;
            }).attr("transform", function(d, i) {
                return "translate(0," + i * 15 + ")";
            }).each(function(d) {
                d.width = this.getBBox().width;
            });
            legendItems.append("rect").attr("class", "legend-item-swatch").attr("height", 10).attr("width", 10).attr("x", -12).attr("y", -10).attr("transform", function(d, i) {
                return "translate(0," + i * 15 + ")";
            }).attr("fill", function(d) {
                return chart.colors(d.name);
            });
            if (!chart.hasRenderedOnce) {
                legendGroup.attr("transform", "translate(" + (config.paddedWidth() + 35) + ",0)");
            } else {
                legendGroup.transition().duration(1e3).attr("transform", "translate(" + (config.paddedWidth() + 35) + ",0)");
            }
        }
        renderLegend(data);
        function update(newData) {
            data = self.data = check.defined(newData) ? newData : self.data;
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
            });
            series.select("path").transition().duration(1e3).attr("d", function(d) {
                return lineGenerator(d.data);
            }).style("stroke", function(d) {
                return chart.colors(d.name);
            });
            focus.select(".x.axis").transition().duration(1e3).call(chart.xAxis).attr("transform", "translate(0," + config.paddedHeight() + ")");
            focus.select(".y.axis").transition().duration(1e3).call(chart.yAxis);
            series.selectAll(".dots").data(function(d) {
                d.data.map(function(p) {
                    p.name = d.name;
                });
                return d.data;
            }).transition().duration(1e3).attr("cy", function(d) {
                return chart.yScale(d.y);
            }).attr("cx", function(d) {
                return chart.xScale(d.x);
            });
            brushData.series = brushData.series.data(data);
            brushData.series.enter().append("g").attr("class", "series").append("path").attr("d", function(d) {
                return brushLineGenerator(d.data);
            }).style("stroke", function(d) {
                return chart.colors(d.name);
            }).attr("class", "line");
            brushData.series.select("path").transition().duration(1e3).attr("d", function(d) {
                return brushLineGenerator(d.data);
            }).style("stroke", function(d) {
                return chart.colors(d.name);
            });
            brushData.chart.xScale.domain(chart.xScale.domain());
            brushData.brush.x(brushData.chart.xScale).extent([ d3.min(data, function(series) {
                return d3.min(series.data, function(d) {
                    return d.x;
                });
            }), d3.max(data, function(series) {
                return d3.max(series.data, function(d) {
                    return d.x;
                });
            }) ]);
            context.attr("transform", "translate(0," + (config.paddedHeight() + brushData.config.margin.bottom + 4) + ")");
            context.select(".x.brush").transition().duration(1e3).call(brushData.brush);
            context.select(".extent").transition().duration(1e3).attr("x", 0).attr("width", config.paddedWidth());
            context.select(".resize.e").transition().duration(1e3).attr("transform", "translate(" + config.paddedWidth() + ",0)");
            context.select(".resize.w").transition().duration(1e3).attr("transform", "translate(0,0)");
            context.select(".x.axis").transition().duration(1e3).call(brushData.chart.xAxis).attr("transform", "translate(0," + brushData.config.height() + ")");
            renderTooltip(data);
            renderLegend(data);
            sendBrushData();
        }
        chart.update = update;
        update.width = function(value) {
            return chart.width(value, function() {
                updateX();
                brushData.clipping.attr("width", config.paddedWidth() + config.dotSize * 2);
                selection.select(".x.axis .label").transition().duration(1e3).attr("x", config.paddedWidth() / 2).attr("y", 28);
            });
        };
        update.height = function(value) {
            return chart.height(value, function() {
                updateY();
                brushData.clipping.attr("height", config.paddedHeight() + config.dotSize * 2);
                context.attr("transform", "translate(0," + brushData.config.height() + ")");
                context.select(".x.brush").selectAll("rect").attr("height", brushData.config.height() - 5).attr("transform", "translate(0," + 5 + ")");
                selection.select(".y.axis .label").transition().duration(1e3).attr("y", config.margin.left * -1).attr("x", config.paddedHeight() / 2 * -1);
                return update();
            });
        };
        update.rightMargin = function(value) {
            if (!arguments.length) {
                return chart.config.margin.right;
            }
            chart.config.margin.right = value;
            updateX();
            brushData.clipping.attr("width", config.paddedWidth() + config.dotSize * 2);
            renderTooltip(data);
            return update;
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
        selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
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
    exports["isD3Selection"] = isD3Selection;
    exports["toCSV"] = toCSV;
    exports["HeatMapBase"] = HeatMapBase;
    exports["heatMap"] = heatMap;
    exports["line"] = line;
    exports["pie"] = pie;
    exports["tooltip"] = tooltip;
})({}, function() {
    return this;
}());