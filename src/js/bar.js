'use strict';
/* global d3: false, check: false, ChartBase, scrollPosition: false, tooltip */
/* exported bar */
var bar = function (selection, data) {
    selection = check.string(selection) ? d3.select(selection) : selection;
    var chart = new ChartBase(selection, 'bar');
    var config = chart.config;
    chart.height(150);
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
            .orient('left');
    }

    updateX();

    function updateY() {
        chart.yScale = d3.scale.linear()
            .domain([0, d3.max(data, function (d) {
                return d.value;
            })])
            .range([0, config.paddedWidth()]);
        chart.yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .orient('bottom');
    }

    updateY();

    // ------------------------------------------------------------------------
    // SVG
    // ------------------------------------------------------------------------
    chart.renderArea.append('g')
        .attr('class', 'x axis')
        .call(chart.xAxis)
        .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', config.margin.left * -1)
        .attr('x', (config.paddedHeight() / 2) * -1)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('');

    chart.renderArea.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,' + config.paddedHeight() + ')')
        .call(chart.yAxis)
        .append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('x', config.paddedWidth() / 2)
        .attr('y', 28)
        .text('');

    var bars = chart.renderArea.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar diagrammatica-tooltip-target')
        .attr('x', 0)
        .attr('y', function (d) {
            return chart.xScale(d.name);
        })
        .attr('width', function (d) {
            return chart.yScale(d.value);
        })
        .attr('height', chart.xScale.rangeBand())
        .attr('fill', function (d) {
            return chart.colors(d.value);
        });

    // ------------------------------------------------------------------------
    // Tooltip
    // ------------------------------------------------------------------------
    config.tooltipHtml = function (d) {
        var html = '<div class="left-arrow diagrammatica-tooltip-inline"></div>';
        html += '<div class="diagrammatica-tooltip-content diagrammatica-tooltip-inline">' + d.value + '</div>';
        return html;
    };

    bars.on('mouseover', function (d) {
        tooltip.transition().style('opacity', 1);
        var parentBox = this.getBoundingClientRect();
        var tooltipBox = tooltip.node().getBoundingClientRect();
        var boxHeightOffset = (parentBox.height - tooltipBox.height) / 2;
        tooltip.html(config.tooltipHtml(d))
            .style('left', parentBox.right + 'px')
            .style('top', parentBox.top + scrollPosition().y + boxHeightOffset + 'px');
    })
        .on('mouseout', function () {
            tooltip.style('opacity', 0);
        });

    // ------------------------------------------------------------------------
    // Update/re-render
    // ------------------------------------------------------------------------
    function update(newData) {
        data = check.defined(newData) ? newData : data;

        updateY();
        chart.renderArea.select('.y.axis')
            .transition()
            .duration(1000)
            .call(chart.yAxis)
            .attr('transform', 'translate(0,' + config.paddedHeight() + ')');


        updateX();
        chart.renderArea.select('.x.axis')
            .transition()
            .duration(1000)
            .call(chart.xAxis);

        chart.renderArea.selectAll('.bar')
            .data(data)
            .transition()
            .delay(function (d, i) {
                return i * 100;
            })
            .duration(500)
            .ease('linear')
            .attr('y', function (d) {
                return chart.xScale(d.name);
            })
            .attr('width', function (d) {
                return chart.yScale(d.value);
            })
            .attr('height', chart.xScale.rangeBand());
    }

    chart.update = update;

    // ------------------------------------------------------------------------
    // Properties
    // ------------------------------------------------------------------------
    update.width = function (value) {
        return chart.width(value, function () {
            updateY();
            selection.select('.y.axis .label')
                .transition()
                .duration(1000)
                .attr('x', config.paddedWidth() / 2)
                .attr('y', 28);
        });
    };

    update.height = function (value) {
        return chart.height(value, function () {
            updateX();
            selection.select('.x.axis .label')
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

    update.chartBase = function () {
        return chart;
    };

    update.updateY = function () {
        return updateY;
    };

    update.updateX = function () {
        return updateX;
    };

    update.bars = function () {
        return bars;
    };

    return update;
};
