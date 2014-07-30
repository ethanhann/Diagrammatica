'use strict';
/* global d3: false, check: false, ChartBase */
/* exported column */
var column = function (selection, data) {
    selection = check.string(selection) ? d3.select(selection) : selection;
    var chart = new ChartBase(selection, 'column');
    var config = chart.config;

    // ------------------------------------------------------------------------
    // Scales and axes
    // ------------------------------------------------------------------------
    function updateX() {
        chart.xScale = d3.scale.ordinal()
            .domain(data.map(function (d) {
                return d.name;
            }))
            .rangeRoundBands([0, config.paddedHeight()], 0.1);
        chart.xAxis = d3.svg.axis()
            .scale(chart.xScale)
            .orient('bottom');
    }

    updateX();

    function updateY() {
        chart.yScale = d3.scale.linear()
            .domain([0, d3.max(data, function (d) {
                return d.value;
            })])
            .range([config.paddedHeight(), 0]);
        chart.yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .orient('left');
    }

    updateY();

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

//    var tooltipTemplate = function(d) {
//        return d.value;
//    };
//
//    if(check.defined(d3.tip)) {
//        var tip = d3.tip()
//            .attr('class', 'd3-tip')
//            .offset([-10, 0])
//            .html(tooltipTemplate);
//        svg.call(tip);
//        svg.selectAll('.column')
//            .on('mouseover', tip.show)
//            .on('mouseout', tip.hide);
//    }

    // ------------------------------------------------------------------------
    // Update/re-render
    // ------------------------------------------------------------------------
    function update(newData) {
        data = check.defined(newData) ? newData : data;

        updateY();
        chart.renderArea.select('.y.axis')
            .transition()
            .duration(1000)
            .call(chart.yAxis);

        updateX();
        chart.renderArea.select('.x.axis')
            .transition()
            .duration(1000)
            .call(chart.xAxis)
            .attr('transform', 'translate(0,' + config.paddedHeight() + ')');

        chart.renderArea.selectAll('.column')
            .data(data)
            .transition()
            .duration(1000)
            .ease('linear')
            .attr('x', function (d) {
                return chart.xScale(d.name);
            })
            .attr('y', function (d) {
                return chart.yScale(d.value);
            })
            .attr('width', chart.xScale.rangeBand())
            .attr('height', function (d) {
                return config.paddedHeight() - chart.yScale(d.value);
            });
    }
    chart.update = update;

    // ------------------------------------------------------------------------
    // Properties
    // ------------------------------------------------------------------------
    update.width = function (value) {
        return chart.width(value, function () {
            updateX();
            selection.select('.x.axis .label')
                .transition()
                .duration(1000)
                .attr('x', config.paddedWidth() / 2)
                .attr('y', 28);
        });
    };

    update.height = function (value) {
        return chart.height(value, function () {
            updateY();
            selection.select('.y.axis .label')
                .transition()
                .duration(1000)
                .attr('y', config.margin.left * -1)
                .attr('x', (config.paddedHeight() / 2) * -1);
        });
    };

    update.yAxisLabelText = function (value) {
        return chart.yAxisLabelText(value);
    };

    update.xAxisLabelText = function (value) {
        return chart.xAxisLabelText(value);
    };

    return update;
};
