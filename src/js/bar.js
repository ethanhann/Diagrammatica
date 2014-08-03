'use strict';
/* global d3: false, check: false, ChartBase, scrollPosition: false, tooltip */
/* exported bar */
var BarBase = function (selection, data, orientation) {
    this.selection = check.string(selection) ? d3.select(selection) : selection;
    this.data = data;
    var chart = this.chart = new ChartBase(this.selection, 'bar');
    var config = this.config = chart.config;
    orientation = this.orientation = orientation || 'horizontal';
    var isHorizontal = this.isHorizontal = function () {
        return orientation === 'horizontal';
    };
    chart.xScale = d3.scale.ordinal();
    chart.yScale = d3.scale.linear();
    this.updateX = function (newData) {
        data = check.defined(newData) ? newData : data;
        var xScaleRange = isHorizontal() ? [0, config.paddedHeight()] : [0, config.paddedWidth()];
        chart.xScale
            .domain(data.map(function (d) {
                return d.name;
            }))
            .rangeRoundBands(xScaleRange, 0.1);
        var xAxisOrient = isHorizontal() ? 'left' : 'bottom';
        chart.xAxis = d3.svg.axis()
            .scale(chart.xScale)
            .orient(xAxisOrient);
    };
    this.updateY = function (newData) {
        data = check.defined(newData) ? newData : data;
        chart.yScale
            .domain([0, d3.max(data, function (d) {
                return d.value;
            })]);
        var yScaleRange = isHorizontal() ? [0, config.paddedWidth()] : [config.paddedHeight(), 0];
        chart.yScale.range(yScaleRange);
        var yAxisOrient = isHorizontal() ? 'bottom' : 'left';
        chart.yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .orient(yAxisOrient);
    };
    this.updateX();
    this.updateY();

    config.tooltipHtml = function (d) {
        var html = '<div class="left-arrow diagrammatica-tooltip-inline"></div>';
        html += '<div class="diagrammatica-tooltip-content diagrammatica-tooltip-inline">' + d.value + '</div>';
        return html;
    };
};

BarBase.prototype.renderAxis = function (axis) {
    var chart = this.chart;
    var config = this.config;
    var selection = chart.renderArea.append('g')
        .attr('class', axis + ' axis')
        .call(chart[axis + 'Axis']);
    var text = selection.append('text')
        .attr('class', axis + ' label')
        .attr('text-anchor', 'middle');
    if ((this.isHorizontal() && axis === 'x') || (!this.isHorizontal() && axis === 'y')) {
        text.attr('transform', 'rotate(-90)')
            .attr('x', (config.paddedHeight() / 2) * -1)
            .attr('y', config.margin.left * -1)
            .attr('dy', '1em');
    } else {
        selection.attr('transform', 'translate(0,' + config.paddedHeight() + ')');
        text.attr('x', config.paddedWidth() / 2)
            .attr('y', 28);
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
    var x = 0;
    var y = function (d) {
        return chart.xScale(d.name);
    };
    var width = function (d) {
        return chart.yScale(d.value);
    };
    var height = chart.xScale.rangeBand();
    if (!this.isHorizontal()) {
        x = function (d) {
            return chart.xScale(d.name);
        };
        y = function (d) {
            return chart.yScale(d.value);
        };
        width = chart.xScale.rangeBand();
        height = function (d) {
            return config.paddedHeight() - chart.yScale(d.value);
        };
    }
    this.bars
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height);
    return this;
};

BarBase.prototype.render = function () {
    this.renderAxis('x');
    this.renderAxis('y');
    this.renderBars();
    return this;
};

BarBase.prototype.updateAxes = function (data) {
    var chart = this.chart;
    var config = this.config;
    this.updateY(data);
    var yAxisSelection = chart.renderArea.select('.y.axis')
        .transition()
        .call(chart.yAxis);
    this.updateX(data);
    var xAxisSelection = chart.renderArea.select('.x.axis')
        .transition()
        .call(chart.xAxis);
    var axisToTranslate = this.isHorizontal() ? yAxisSelection : xAxisSelection;
    axisToTranslate.attr('transform', 'translate(0,' + config.paddedHeight() + ')');
    return this;
};

BarBase.prototype.updateBars = function (data) {
    var chart = this.chart;
    var bars = this.bars;
    var config = this.config;
    var barTransition = bars.data(data)
        .transition();
    if (this.isHorizontal()) {
        barTransition
            .attr('y', function (d) {
                return chart.xScale(d.name);
            })
            .attr('width', function (d) {
                return chart.yScale(d.value);
            })
            .attr('height', chart.xScale.rangeBand());
    } else {
        barTransition
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

var bar = function (selection, data, orientation) {
    var barBase = new BarBase(selection, data, orientation).render();
    var chart = barBase.chart;
    var config = barBase.config;
    var updateX = barBase.updateX;
    var updateY = barBase.updateY;
    var bars = barBase.bars;

    var update = chart.update = function (newData) {
        data = check.defined(newData) ? newData : data;
        barBase.updateAxes(data);
        barBase.updateBars(data);
    };

    update.height = function (value) {
        var axis = barBase.isHorizontal() ? 'x' : 'y';
        return chart.height(value, function () {
            updateX();
            barBase.selection.select('.' + axis + '.axis .label')
                .transition()
                .attr('y', config.margin.left * -1)
                .attr('x', (config.paddedHeight() / 2) * -1);
        });
    };

    update.width = function (value) {
        var axis = barBase.isHorizontal() ? 'y' : 'x';
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

    return update;
};
