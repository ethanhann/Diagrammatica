'use strict';
/* global d3: false, check: false, ChartBase */
/* exported column */

var ColumnBase = function (selection, data) {
    selection = this.selection = check.string(selection) ? d3.select(selection) : selection;
    var chart = this.chart = new ChartBase(selection, 'column');
    var config = this.config = chart.config;

    // ------------------------------------------------------------------------
    // Scales and axes
    // ------------------------------------------------------------------------
    this.updateX = function () {
        chart.xScale = d3.scale.ordinal()
            .domain(data.map(function (d) {
                return d.name;
            }))
            .rangeRoundBands([0, config.paddedHeight()], 0.1);
        chart.xAxis = d3.svg.axis()
            .scale(chart.xScale)
            .orient('bottom');
    };
    this.updateX();

    this.updateY = function () {
        chart.yScale = d3.scale.linear()
            .domain([0, d3.max(data, function (d) {
                return d.value;
            })])
            .range([config.paddedHeight(), 0]);
        chart.yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .orient('left');
    };
    this.updateY();

    // ------------------------------------------------------------------------
    // SVG
    // ------------------------------------------------------------------------
    chart.renderArea.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + config.paddedHeight() + ')')
        .call(chart.xAxis)
        .append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'middle')
        .attr('x', config.paddedWidth() / 2)
        .attr('y', 28)
        .text('');

    chart.renderArea.append('g')
        .attr('class', 'y axis')
        .call(chart.yAxis)
        .append('text')
        .attr('class', 'y label')
        .attr('transform', 'rotate(-90)')
        .attr('y', config.margin.left * -1)
        .attr('x', (config.paddedHeight() / 2) * -1)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('');

    chart.renderArea.selectAll('.column')
        .data(data)
        .enter().append('rect')
        .attr('class', 'column')
        .attr('x', function (d) {
            return chart.xScale(d.name);
        })
        .attr('y', function (d) {
            return chart.yScale(d.value);
        })
        .attr('width', chart.xScale.rangeBand())
        .attr('height', function (d) {
            return config.paddedHeight() - chart.yScale(d.value);
        })
        .attr('fill', function (d) {
            return chart.colors(d.value);
        });
};

var column = function (selection, data) {
    var columnBase = new ColumnBase(selection, data);

    // ------------------------------------------------------------------------
    // Update/re-render
    // ------------------------------------------------------------------------
    var update = columnBase.chart.update = function (newData) {
        data = check.defined(newData) ? newData : data;

        columnBase.updateY();
        columnBase.chart.renderArea.select('.y.axis')
            .transition()
            .duration(1000)
            .call(columnBase.chart.yAxis);

        columnBase.updateX();
        columnBase.chart.renderArea.select('.x.axis')
            .transition()
            .duration(1000)
            .call(columnBase.chart.xAxis)
            .attr('transform', 'translate(0,' + columnBase.config.paddedHeight() + ')');

        columnBase.chart.renderArea.selectAll('.column')
            .data(data)
            .transition()
            .duration(1000)
            .ease('linear')
            .attr('x', function (d) {
                return columnBase.chart.xScale(d.name);
            })
            .attr('y', function (d) {
                return columnBase.chart.yScale(d.value);
            })
            .attr('width', columnBase.chart.xScale.rangeBand())
            .attr('height', function (d) {
                return columnBase.config.paddedHeight() - columnBase.chart.yScale(d.value);
            });
    };

    // ------------------------------------------------------------------------
    // Properties
    // ------------------------------------------------------------------------
    update.height = function (value) {
        return columnBase.chart.height(value, function () {
            columnBase.updateY();
            columnBase.selection.select('.y.axis .label')
                .transition()
                .duration(1000)
                .attr('y', columnBase.config.margin.left * -1)
                .attr('x', (columnBase.config.paddedHeight() / 2) * -1);
        });
    };

    update.width = function (value) {
        return columnBase.chart.width(value, function () {
            columnBase.updateX();
            columnBase.selection.select('.x.axis .label')
                .transition()
                .duration(1000)
                .attr('x', columnBase.config.paddedWidth() / 2)
                .attr('y', 28);
        });
    };

    update.yAxisLabelText = function (value) {
        return columnBase.chart.yAxisLabelText(value);
    };

    update.xAxisLabelText = function (value) {
        return columnBase.chart.xAxisLabelText(value);
    };

    return update;
};

