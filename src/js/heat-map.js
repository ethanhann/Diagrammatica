'use strict';
/* global d3: false, check: false, ChartBase, colorbrewer */
/* exported heatMap */
var HeatMapBase = function (selection, data) {
    selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
    this.data = data;
    var chart = this.chart = new ChartBase(selection, 'heat-map');
    var config = this.config = chart.config;
    config.margin.top = 55;
    config.margin.bottom = 40;
    config.margin.left = 50;
    chart.updateDimensions();

    this.updateCellPrimitives = function (data) {
        this.dates = d3.set(data.map(function (d) {
            return d.date;
        })).values();
        this.cellWidth = Math.floor(config.paddedWidth() / this.dates.length); // divide by number points of points on the x axis
        this.categories = d3.set(data.map(function (d) {
            return d.category;
        })).values();
        this.cellHeight = Math.floor(config.paddedHeight() / this.categories.length); // divide by number of categories
    };
    this.updateCellPrimitives(data);

    this.buckets = 9;
    this.colors = colorbrewer.OrRd[this.buckets];

    chart.xScale = d3.scale.linear();
    chart.yScale = d3.scale.ordinal();
    chart.colorScale = d3.scale.quantile();
    this.updateX = function (data) {
        this.updateCellPrimitives(data);
        chart.xScale
            .domain([0, this.dates.length - 1])
            .range([0, config.paddedWidth() - this.cellWidth]);
    };
    this.updateY = function (data) {
        chart.yScale
            .domain(data.map(function (d) {
                return d.category;
            }))
            .rangeRoundBands([0, config.paddedHeight() + 3])
    };
    this.updateColors = function (data) {
        chart.colorScale
            .domain([0, this.buckets - 1, d3.max(data, function (d) {
                return d.value;
            })])
            .range(this.colors)
    };

    this.updateX(data);
    this.updateY(data);
    this.updateColors(data);
};

HeatMapBase.prototype.renderRectangles = function () {
    var chart = this.chart;
    var data = this.data;
    var cellHeight = this.cellHeight;
    var cellWidth = this.cellWidth;
    var dates = this.dates;
    var categories = this.categories;

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
        .attr('transform', 'translate(-6,' + cellHeight / 2 + ')')
        .attr('class', function (d, i) {
            return ((i >= 0 && i <= 4) ? 'categoryLabel mono axis axis-category' : 'categoryLabel mono axis');
        });

    var dateFormat = d3.time.format('%b %Y');
    this.xLabels = chart.renderArea.selectAll('.xLabel')
        .data(dates)
        .enter().append('text')
        .text(function (d) {
            return dateFormat(new Date(d));
        })
        .attr('x', 0)
        .attr('y', function (d, i) {
            return i * cellWidth;
        })
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90) translate(30, ' + cellWidth / 2 + ')')
        .attr('class', function (d, i) {
            return ((i >= 7 && i <= 16) ? 'timeLabel mono axis axis-date' : 'timeLabel mono axis');
        });

    this.rectangles = chart.renderArea.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('x', function (d, i) {
            return chart.xScale(i % dates.length);
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

    var legendElementWidth = this.legendElementWidth = Math.floor(config.paddedWidth() / buckets);
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
    this.renderRectangles();
    this.renderLegend();
    return this;
};

var heatMap = function (selection, data) {
    var heatMapBase = new HeatMapBase(selection, data).render();
    var chart = heatMapBase.chart;
    var update =  heatMapBase.chart.update = function (newData) {
        data = heatMapBase.data = check.defined(newData) ? newData : heatMapBase.data;
        heatMapBase.updateColors(data);
        heatMapBase.updateX(data);
        heatMapBase.updateY(data);
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

    return update;
};
