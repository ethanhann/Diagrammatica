'use strict';

var ChartBase = function (selection, chartClass) {
    this.hasRenderedOnce = false;
    this.selection = check.string(selection) ? d3.select(selection) : selection;
    this.update = function () {
    };
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
    this.config.paddedWidth = function () {
        return config.width - config.margin.left - config.margin.right;
    };
    this.config.paddedHeight = function () {
        return config.height - config.margin.top - config.margin.bottom;
    };
    this.config.tooltipHtml = function () {
        return 'tooltip content';
    };
    this.svg = this.selection.append('svg')
        .attr('class', 'diagrammatica diagrammatica-' + chartClass)
        .attr('width', config.width)
        .attr('height', config.height);
    this.renderArea = this.svg.append('g')
        .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');
    this.updateDimensions = function () {
        this.svg.attr('width', config.width).attr('height', config.height);
        this.renderArea.attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')');
    };
    this.xScale = function () {
    };
    this.xAxis = function () {
    };
    this.yScale = function () {
    };
    this.yAxis = function () {
    };
    this.colors = d3.scale.category10();
};

ChartBase.prototype = {
    axisLabelText: function (axisLetter, value) {
        var label = this.selection.select('.' + axisLetter + '.axis .label');
        if (check.not.defined(value)) {
            return label.empty() ? '' : label.text();
        }
        label.text(value);
        return this.update;
    },
    yAxisLabelText: function (value) {
        return this.axisLabelText('y', value);
    },
    xAxisLabelText: function (value) {
        return this.axisLabelText('x', value);
    },
    width: function (value, axisUpdateCallback) {
        if (!check.defined(value)) {
            return this.config.width;
        }
        this.config.width = value;
        if (check.defined(axisUpdateCallback)) {
            axisUpdateCallback();
        }
        this.svg.attr('width', this.config.width);
        this.updateDimensions();
        return this.update;
    },
    height: function (value, axisUpdateCallback) {
        if (!check.defined(value)) {
            return this.config.height;
        }
        this.config.height = value;
        if (check.defined(axisUpdateCallback)) {
            axisUpdateCallback();
        }
        this.svg.attr('height', this.config.height);
        this.updateDimensions();
        return this.update;
    },
    tooltipHtml: function (value) {
        if (!arguments.length) {
            return this.config.tooltipHtml();
        }
        this.config.tooltipHtml = value;
        return this.update;
    }
};
