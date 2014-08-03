'use strict';
/* global d3: false, check: false, ChartBase, colorbrewer */
/* exported heatMap */
var HeatMapBase = function (selection, data) {
    selection = this.selection = check.string(selection) ? d3.select(selection) : selection;
    this.data = data;
    var chart = this.chart = new ChartBase(selection, 'heat-map');
    var config = this.config = chart.config;
    config.margin.top = 55;
    config.margin.bottom = 40;
    config.margin.left = 50;
    chart.updateDimensions();
    this.dates = d3.set(data.map(function (d) { return d.date; })).values();
    this.cellWidth = Math.floor(config.paddedWidth() / this.dates.length); // divide by number points of points on the x axis
    this.categories = d3.set(data.map(function (d) { return d.category; })).values();
    this.cellHeight = Math.floor(config.paddedHeight() / this.categories.length); // divide by number of categories
    this.buckets = 9;
    this.colors = colorbrewer.OrRd[this.buckets];
};

HeatMapBase.prototype.renderRectangles = function () {
    var chart = this.chart;
    var data = this.data;
    var config = this.config;
    var cellHeight = this.cellHeight;
    var cellWidth = this.cellWidth;
    var dates = this.dates;
    var buckets = this.buckets;
    var categories = this.categories;
    var colors = this.colors;

    var xCellScale = d3.scale.linear()
        .domain([0, dates.length - 1])
        .range([0, config.paddedWidth() - cellWidth]);

    var yCellScale = d3.scale.ordinal()
        .domain(data.map(function (d) {
            return d.category;
        }))
        .rangeRoundBands([0, config.paddedHeight() + 3]);

    chart.colors = d3.scale.quantile()
        .domain([0, buckets - 1, d3.max(data, function (d) {
            return d.value;
        })])
        .range(colors);

    chart.renderArea.selectAll('.categoryLabel')
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
    chart.renderArea.selectAll('.timeLabel')
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

    var heatMap = chart.renderArea.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('x', function (d, i) {
            return xCellScale(i % dates.length);
        })
        .attr('y', function (d) {
            return yCellScale(d.category);
        })
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .style('fill', function (d) {
            return chart.colors(d.value);
        });

    // Tooltip
    heatMap.append('title').text(function (d) {
        return d.value;
    });

    return this;
};

HeatMapBase.prototype.renderLegend = function () {
    var chart = this.chart;
    var config = this.config;
    var buckets = this.buckets;
    var cellHeight = this.cellHeight;
    var colors = this.colors;

    var legendElementWidth = Math.floor(config.paddedWidth() / buckets);
    var legend = chart.renderArea.append('g')
        .attr('class', 'legend');
    var legendItems = legend.selectAll('.legend-item')
        .data([0].concat(chart.colors.quantiles()), function (d) {
            return d;
        })
        .enter().append('g')
        .attr('class', 'legend-item');

    legendItems.append('rect')
        .attr('x', function (d, i) {
            return legendElementWidth * i;
        })
        .attr('y', config.paddedHeight() + 10)
        .attr('width', legendElementWidth)
        .attr('height', cellHeight / 2)
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
        .attr('y', config.paddedHeight() + cellHeight + 2);

    return this;
};

HeatMapBase.prototype.render = function () {
    this.renderRectangles();
    this.renderLegend();
    return this;
};

var heatMap = function (selection, data) {
    var heatMapBase = new HeatMapBase(selection, data).render();

    var update = heatMapBase.chart.update = function () {
    };

    return update;
};
