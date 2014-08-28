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
    this.dateUnit = 'month';
    var dateRange = d3.extent(data.map(function (d) {
        return d.date;
    }));
    this.fromX = dateRange[0];
    this.toX = dateRange[1];
    var self = this;
    this.getDates = function (data) {
        var dates = d3.set(data.map(function (d) {
            return d.date;
        })).values();
        dates = dates.filter(function (d) {
            var fromMoment = moment(new Date(d));
            return fromMoment.isAfter(self.fromX, self.dateUnit) || fromMoment.isSame(self.fromX, self.dateUnit);
        });
        dates = dates.filter(function (d) {
            var toMoment = moment(new Date(d));
            return toMoment.isBefore(self.toX, self.dateUnit) || toMoment.isSame(self.toX, self.dateUnit);
        });
        return dates;
    };
};

HeatMapBase.prototype.prepareDisplayData = function () {
    var dateThreshold = 24;
    var monthDates = this.getDates(this.data);

    this.dateUnit = monthDates.length >= dateThreshold ? 'year' : 'month';
    this.displayData = {
        year: {
            data: [],
            dateFormat: d3.time.format('%Y'),
            dates: []
        },
        month: {
            data: this.data,
            dateFormat: d3.time.format('%b %Y'),
            dates: monthDates
        }
    };
    if (this.dateUnit === 'year') {
        var x = d3.nest()
            .key(function (d) { return d.category; })
            .key(function (d) { return (new Date(d.date)).getFullYear(); })
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
        this.displayData[this.dateUnit].data = yearData;
        this.displayData[this.dateUnit].dates = this.getDates(yearData);
    }

    this.getDisplayData = function () {
        return this.displayData[this.dateUnit];
    };
};

HeatMapBase.prototype.preRender = function () {
    var displayData = this.getDisplayData();
    var chart = this.chart;
    var config = this.chart.config;
    this.updateCellPrimitives = function (data) {
        displayData.dates = this.getDates(data);
        this.cellWidth = Math.floor(config.paddedWidth() / displayData.dates.length); // divide by number points of points on the x axis
        this.categories = d3.set(data.map(function (d) {
            return d.category;
        })).values();
        this.cellHeight = Math.floor(config.paddedHeight() / this.categories.length); // divide by number of categories
    };
    this.updateCellPrimitives(displayData.data);

    this.colors = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
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
    var displayData = this.getDisplayData();

    var labelPadding = 6;
    this.yLabels = chart.renderArea.selectAll('.yLabel')
        .data(categories)
        .enter().append('text')
        .text(function (d) {
            return d;
        })
        .attr('x', 0)
        .attr('y', function (d, i) {
            return i * cellHeight;
        })
        .style('text-anchor', 'end')
        .attr('transform', 'translate(' + -labelPadding + ',' + cellHeight / 2 + ')')
        .attr('class', 'axis yLabel');

    var maxYLabelWidth = 0;
    this.yLabels.each(function () {
        if (this.getBBox().width > maxYLabelWidth) {
            maxYLabelWidth = this.getBBox().width + labelPadding;
        }
    });
    chart.config.margin.left = maxYLabelWidth;
    chart.updateDimensions();

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

    var maxXLabelHeight = 0;
    this.xLabels.each(function () {
        if (this.getBBox().height > maxXLabelHeight) {
            maxXLabelHeight = this.getBBox().height;
        }
    });

    this.xLabels.attr('y', function (d, i) {
        return chart.xScale(i % displayData.dates.length) + (cellWidth / 2) + (maxXLabelHeight / 4);
    });

    this.rectangles = chart.renderArea.selectAll('rect')
        .data(displayData.data)
        .enter().append('rect')
        .attr('x', function (d, i) {
            return chart.xScale(i % displayData.dates.length);
        })
        .attr('y', function (d) {
            return chart.yScale(d.category);
        })
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .style('fill', function (d) {
            return chart.colorScale(d.value);
        });

    this.rectangles.append('title').text(function (d) {
        return d.value;
    });

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
        data = heatMapBase.data = check.defined(newData) ? newData : heatMapBase.data;
        heatMapBase.prepareDisplayData();
        var displayData = heatMapBase.getDisplayData();
        heatMapBase.updateColors(displayData.data);
        heatMapBase.updateX(displayData.data);
        heatMapBase.updateY(displayData.data);
        heatMapBase.xLabels.remove();
        heatMapBase.yLabels.remove();
        heatMapBase.rectangles.remove();
        heatMapBase.legend.remove();
        heatMapBase.render();
    };

    update.width = function (value) {
        return chart.width(value, function () {
            heatMapBase.updateY(heatMapBase.data);
        });
    };

    update.margin = function (value) {
        if (!check.defined(value)) {
            return chart.config.margin;
        }
        chart.config.margin = value;
        return update;
    };

    update.margin.left = function (value) {
        if (!check.defined(value)) {
            return chart.config.margin.left;
        }
        chart.config.margin.left = value;
        return update;
    };

    update.displayData = function () {
        return heatMapBase.getDisplayData();
    };

    update.fromX = function (value) {
        if (!check.defined(value)) {
            return heatMapBase.fromX;
        }
        heatMapBase.fromX = value;
        return update;
    };

    update.toX = function (value) {
        if (!check.defined(value)) {
            return heatMapBase.toX;
        }
        heatMapBase.toX = value;
        return update;
    };

    return update;
};
