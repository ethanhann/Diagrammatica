'use strict';
/* global d3: false, check: false, ChartBase, isD3Selection: false, moment: false */
/* exported heatMap */
var HeatMapBase = function (selection, data) {
    this.data = data;
    selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
    var chart = this.chart = new ChartBase(selection, 'heat-map');
    var config = this.config = chart.config;
    config.margin.top = 55;
    config.margin.bottom = 40;
    config.margin.right = 0;
    chart.updateDimensions();
    var dateRange = this.dateRange();
    this.fromX = moment(dateRange.from).toDate();
    this.toX = moment(dateRange.to).toDate();
};


HeatMapBase.prototype.filterDataByDateRange = function (data, unit) {
    var self = this;
    // Filter data by fromX and toX.
    return data.filter(function (d) {
        var m = moment(new Date(d.date));
        return (m.isAfter(self.fromX, unit) || m.isSame(self.fromX, unit)) &&
        m.isBefore(self.toX, unit) || m.isSame(self.toX, unit);
    });
};

HeatMapBase.prototype.getDates = function (data, unit) {
    var self = this;
    // Compute the set of dates that are equal to or after fromX and equal to or before toX.
    var dates = data.map(function (d) {
        return d.date;
    });
    return d3.set(dates)
        .values()
        .filter(function (d) {
            var m = moment(new Date(d));
            return (m.isAfter(self.fromX, unit) || m.isSame(self.fromX, unit)) &&
            m.isBefore(self.toX, unit) || m.isSame(self.toX, unit);
        });
};

HeatMapBase.prototype.dateRange = function () {
    var r = d3.extent(this.data.map(function (d) {
        return d.date;
    }));
    return {
        from: r[0],
        to: r[1]
    };
};

HeatMapBase.prototype.displayDateUnit = function () {
    return moment(this.toX).diff(this.fromX, 'months') >= 24 ? 'year' : 'month';
};

HeatMapBase.prototype.prepareDisplayData = function () {

    this.displayData = {
        data: this.filterDataByDateRange(this.data, 'month'),
        dateFormat: d3.time.format('%b %Y'),
        dates: this.getDates(this.data, 'month')
    };
    var dateUnit = this.displayDateUnit();
    if (dateUnit === 'year') {
        var x = d3.nest()
            .key(function (d) {
                return d.category;
            })
            .key(function (d) {
                return (new Date(d.date)).getFullYear();
            })
            .entries(this.data);
        var yearData = [];
        x.forEach(function (c) {
            c.values.forEach(function (s) {
                var date = moment(s.key, 'YYYY').toDate();
                yearData.push({
                    category: c.key,
                    date: date,
                    value: d3.sum(s.values, function (d) {
                        return d.value;
                    })
                });
            });
        });
        this.displayData.data = this.filterDataByDateRange(yearData, 'year');
        this.displayData.dates = this.getDates(yearData, 'year');
        this.displayData.dateFormat = d3.time.format('%Y');
    }
};

HeatMapBase.prototype.preRender = function () {
    var displayData = this.displayData;
    var chart = this.chart;
    var config = this.chart.config;
    this.updateCellPrimitives = function (data) {
        this.cellWidth = Math.floor(config.paddedWidth() / displayData.dates.length); // divide by number points of points on the x axis
        this.categories = d3.set(data.map(function (d) {
            return d.category;
        })).values();
        this.cellHeight = Math.floor(config.paddedHeight() / this.categories.length); // divide by number of categories
    };
    this.updateCellPrimitives(displayData.data);

    this.colors = ['#F7F9F5', '#F0F4EC', '#E1E9DA', '#D2DEC7', '#C3D4B5', '#B4C9A2', '#A5BE90', '#96B37D', '#87A96B'];
    this.buckets = this.colors.length;

    chart.xScale = d3.scale.linear();
    chart.yScale = d3.scale.ordinal();
    chart.colorScale = d3.scale.quantile();
    this.updateX = function (data) {
        this.updateCellPrimitives(data);
        chart.xScale
            .domain([0, displayData.dates.length - 1])
            .range([0, config.paddedWidth() - this.cellWidth]);
    };
    this.updateY = function (data) {
        chart.yScale
            .domain(data.map(function (d) {
                return d.category;
            }))
            .rangeRoundBands([0, config.paddedHeight() + 3]);
    };
    this.updateColors = function (data) {
        chart.colorScale
            .domain([0, this.buckets - 1, d3.max(data, function (d) {
                return d.value;
            })])
            .range(this.colors);
    };

    this.updateX(displayData.data);
    this.updateY(displayData.data);
    this.updateColors(displayData.data);
};

HeatMapBase.prototype.renderRectangles = function () {
    var chart = this.chart;
    var cellHeight = this.cellHeight;
    var cellWidth = this.cellWidth;
    var categories = this.categories;
    var displayData = this.displayData;
    var labelPadding = 6;
    this.yLabels = chart.renderArea.selectAll('.yLabel')
        .data(categories)
        .enter().append('text')
        .text(function (d) {
            return d;
        })
        .attr('x', -labelPadding / 2)
        .style('text-anchor', 'end')
        .attr('class', 'axis yLabel');

    if (!this.yLabels.empty()) {
        // Center y label based
        var maxYLabelHeight = d3.max(this.yLabels[0], function (d) {
            return d.getBoundingClientRect().height;
        });
        this.yLabels.attr('y', function (d) {
            return chart.yScale(d) + (cellHeight / 2) + (maxYLabelHeight / 4);
        });
        // Set left padding based on y max label width
        chart.config.margin.left = labelPadding + d3.max(this.yLabels[0], function (d) {
            return d.getBoundingClientRect().width;
        });
        chart.updateDimensions();
    }
    this.xLabels = chart.renderArea.selectAll('.xLabel')
        .data(displayData.dates)
        .enter().append('text')
        .text(function (d) {
            return displayData.dateFormat(new Date(d));
        })
        .attr('x', 0)
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90) translate(30, 0)')
        .attr('class', 'axis xLabel');

    if (!this.xLabels.empty()) {
        // Center x label in rect
        var maxXLabelHeight = d3.max(this.xLabels[0], function (d) {
            return d.getBoundingClientRect().height;
        });
        this.xLabels.attr('y', function (d, i) {
            return chart.xScale(i % displayData.dates.length) + (cellWidth / 2) + (maxXLabelHeight / 8);
        });
    }

    this.rectGroups = chart.renderArea.selectAll('g')
        .data(displayData.data)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            var x = chart.xScale(i % displayData.dates.length);
            var y = chart.yScale(d.category);
            return 'translate(' + x + ',' + y + ')';
        });

    this.rectGroups.append('rect')
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .style('fill', function (d) {
            return chart.colorScale(d.value);
        });

    this.rectGroups
        .append('text')
        .text(function (d) {
            return d.value;
        })
        .attr('x', cellWidth / 2)
        .attr('y', cellHeight / 2)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle');

    return this;
};

HeatMapBase.prototype.renderLegend = function () {
    var chart = this.chart;
    var config = this.config;
    var buckets = this.buckets;
    var colors = this.colors;
    var legendElementWidth = Math.floor(config.paddedWidth() / buckets);
    var legend = this.legend = chart.renderArea.append('g')
        .attr('class', 'legend');
    var legendItems = legend.selectAll('.legend-item')
        .data([0].concat(chart.colorScale.quantiles()), function (d) {
            return d;
        })
        .enter().append('g')
        .attr('class', 'legend-item');

    var swatchHeight = 19;
    legendItems.append('rect')
        .attr('x', function (d, i) {
            return legendElementWidth * i;
        })
        .attr('y', config.paddedHeight() + 10)
        .attr('width', legendElementWidth)
        .attr('height', swatchHeight)
        .style('fill', function (d, i) {
            return colors[i];
        });

    legendItems.append('text')
        .text(function (d) {
            return '≥ ' + Math.round(d);
        })
        .attr('x', function (d, i) {
            return legendElementWidth * i;
        })
        .attr('y', config.paddedHeight() + (swatchHeight * 2) + 2);

    return this;
};

HeatMapBase.prototype.render = function () {
    this.prepareDisplayData();
    this.preRender();
    this.renderRectangles();
    this.renderLegend();
    return this;
};

var heatMap = function (selection, data) {
    var heatMapBase = new HeatMapBase(selection, data).render();
    var chart = heatMapBase.chart;
    var update = heatMapBase.chart.update = function (newData) {
        data = heatMapBase.data = !check.undefined(newData) ? newData : heatMapBase.data;
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

    update.width = function (value) {
        return chart.width(value, function () {
            heatMapBase.updateY(heatMapBase.data);
        });
    };

    update.height = function (value) {
        return chart.height(value, function () {
            heatMapBase.updateX(heatMapBase.data);
        });
    };

    update.margin = function (value) {
        if (check.undefined(value)) {
            return chart.config.margin;
        }
        chart.config.margin = value;
        return update;
    };

    update.margin.left = function (value) {
        if (check.undefined(value)) {
            return chart.config.margin.left;
        }
        chart.config.margin.left = value;
        return update;
    };

    update.displayData = function () {
        return heatMapBase.displayData;
    };

    update.fromX = function (value) {
        if (check.undefined(value)) {
            return heatMapBase.fromX;
        }
        heatMapBase.fromX = value;
        return update;
    };

    update.toX = function (value) {
        if (check.undefined(value)) {
            return heatMapBase.toX;
        }
        heatMapBase.toX = value;
        return update;
    };

    return update;
};
