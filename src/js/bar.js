'use strict';
/* global d3: false, check: false, ChartBase, scrollPosition: false, tooltip */
/* exported bar */
var BarBase = function (selection, data) {
    this.selection = check.string(selection) ? d3.select(selection) : selection;
    this.data = data;
    var chart = this.chart = new ChartBase(this.selection, 'bar');
    var config = this.config = chart.config;
    var orientation = this.orientation = 'horizontal';
    chart.xScale = d3.scale.ordinal();
    chart.yScale = d3.scale.linear();
    this.updateX = function (newData) {
        data = check.defined(newData) ? newData : data;
        var xScaleRange = orientation === 'horizontal' ? [0, config.paddedHeight()] : [0, config.paddedWidth()];
        chart.xScale
            .domain(data.map(function (d) {
                return d.name;
            }))
            .rangeRoundBands(xScaleRange, 0.1);
        console.log(config.paddedHeight());
    };
    this.updateY = function (newData) {
        data = check.defined(newData) ? newData : data;
        chart.yScale
            .domain([0, d3.max(data, function (d) {
                return d.value;
            })]);
        var yScaleRange = orientation === 'horizontal' ? [0, config.paddedWidth()] : [config.paddedHeight(), 0];
        chart.yScale.range(yScaleRange);
    };
    this.updateX();
    this.updateY();
    var xAxisOrient = orientation === 'horizontal' ? 'left' : 'bottom';
    chart.xAxis = d3.svg.axis()
        .scale(chart.xScale)
        .orient(xAxisOrient);
    var yAxisOrient = orientation === 'horizontal' ? 'bottom' : 'left';
    chart.yAxis = d3.svg.axis()
        .scale(chart.yScale)
        .orient(yAxisOrient);
    config.tooltipHtml = function (d) {
        var html = '<div class="left-arrow diagrammatica-tooltip-inline"></div>';
        html += '<div class="diagrammatica-tooltip-content diagrammatica-tooltip-inline">' + d.value + '</div>';
        return html;
    };
};

BarBase.prototype.renderXAxis = function () {
    var chart = this.chart;
    var config = this.config;
    var selection = chart.renderArea.append('g')
        .attr('class', 'x axis')
        .call(chart.xAxis);

    if (this.orientation === 'horizontal') {
        selection.append('text')
            .attr('class', 'x label')
            .attr('transform', 'rotate(-90)')
            .attr('y', config.margin.left * -1)
            .attr('x', (config.paddedHeight() / 2) * -1)
            .attr('dy', '1em')
            .style('text-anchor', 'middle');
    } else {
        selection.attr('transform', 'translate(0,' + config.paddedHeight() + ')')
            .append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'middle')
            .attr('x', config.paddedWidth() / 2)
            .attr('y', 28);
    }
    return this;
};

BarBase.prototype.renderYAxis = function () {
    var chart = this.chart;
    var config = this.config;
    var selection = chart.renderArea.append('g')
        .attr('class', 'y axis')
        .call(chart.yAxis);
    if (this.orientation === 'horizontal') {
        selection.attr('transform', 'translate(0,' + config.paddedHeight() + ')')
            .append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr('x', config.paddedWidth() / 2)
            .attr('y', 28);
    }
    else {
        selection.append('text')
            .attr('class', 'y label')
            .attr('transform', 'rotate(-90)')
            .attr('y', config.margin.left * -1)
            .attr('x', (config.paddedHeight() / 2) * -1)
            .attr('dy', '1em')
            .style('text-anchor', 'middle');
    }
    return this;
};

BarBase.prototype.renderBars = function () {
    var chart = this.chart;
    var data = this.data;
    var config = this.config;
    this.bars = chart.renderArea.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar diagrammatica-tooltip-target')
        .attr('fill', function (d) {
            return chart.colors(d.value);
        })
        .on('mouseover', function (d) {
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

    if (this.orientation === 'horizontal') {
        this.bars
            .attr('x', 0)
            .attr('y', function (d) {
                return chart.xScale(d.name);
            })
            .attr('width', function (d) {
                return chart.yScale(d.value);
            })
            .attr('height', chart.xScale.rangeBand());
    } else {
        this.bars
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

    return this;
};

BarBase.prototype.render = function () {
    this.renderXAxis();
    this.renderYAxis();
    this.renderBars();
    return this;
};

var bar = function (selection, data) {
    var barBase = new BarBase(selection, data).render();
    var chart = barBase.chart;
    var config = barBase.config;
    var updateX = barBase.updateX;
    var updateY = barBase.updateY;
    var bars = barBase.bars;
    var update = chart.update = function (newData) {
        data = check.defined(newData) ? newData : data;
        updateY(data);
        var yAxisSelection = chart.renderArea.select('.y.axis')
            .transition()
            .call(chart.yAxis);
        updateX(data);
        var xAxisSelection = chart.renderArea.select('.x.axis')
            .transition()
            .call(chart.xAxis);
        if (barBase.orientation === 'horizontal') {
            yAxisSelection.attr('transform', 'translate(0,' + config.paddedHeight() + ')');
        } else {
            xAxisSelection.attr('transform', 'translate(0,' + config.paddedHeight() + ')');
        }

        if (barBase.orientation === 'horizontal') {
            bars.data(data)
                .transition()
                .attr('y', function (d) {
                    return chart.xScale(d.name);
                })
                .attr('width', function (d) {
                    return chart.yScale(d.value);
                })
                .attr('height', chart.xScale.rangeBand());
        } else {
            console.log(barBase.orientation);
            bars.data(data)
                .transition()
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
    };

    update.height = function (value) {
        var axis = barBase.orientation === 'horizontal' ? 'x' : 'y';
        return chart.height(value, function () {
            updateX();
            barBase.selection.select('.' + axis + '.axis .label')
                .transition()
                .attr('y', config.margin.left * -1)
                .attr('x', (config.paddedHeight() / 2) * -1);
        });
    };

    update.width = function (value) {
        var axis = barBase.orientation === 'horizontal' ? 'y' : 'x';
        return chart.width(value, function () {
            updateY();
            barBase.selection.select('.' + axis + '.axis .label')
                .transition()
                .attr('x', config.paddedWidth() / 2)
                .attr('y', 28);
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

    update.orientation = function (value) {
        barBase.orientation = value;
    };

    return update;
};
