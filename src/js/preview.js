'use strict';
/* global moment: false */
/* exported Preview */

function Preview(targetChart, data, textTimeFormat) {
    this.chart = {};
    this.config = {};
    this.textTimeFormat = textTimeFormat;
    this.data = data;
    this.targetChartConfig = targetChart.config;

    this.config.margin = {
        top: function () {
            return targetChart.config.paddedHeight() + 45;
        },
        right: targetChart.config.margin.right,
        bottom: 10,
        left: targetChart.config.margin.left
    };
    var self = this;
    this.config.height = function () {
        return targetChart.config.height - self.config.margin.top() - self.config.margin.bottom;
    };
}

Preview.prototype.westDate = function () {
    return this.brush.extent()[0];
};

Preview.prototype.eastDate = function () {
    return this.brush.extent()[1];
};

Preview.prototype.sendPreview = function () {
    var evt = document.createEvent('CustomEvent');
    this.range.select('#fromDate').text(this.textTimeFormat(this.westDate()))
        .transition()
        .duration(this.targetChartConfig.transitionDuration);
    this.range.select('#toDate').text(this.textTimeFormat(this.eastDate()))
        .transition()
        .duration(this.targetChartConfig.transitionDuration)
        .attr('transform', 'translate(' + (this.targetChartConfig.paddedWidth()) + ',-5)');
    this.range.select('#range')
        .transition()
        .duration(this.targetChartConfig.transitionDuration)
        .text(this.dateRange())
        .attr('transform', 'translate(' + (this.targetChartConfig.paddedWidth() / 2) + ',-5)');
    evt.initCustomEvent('brushEvent', true, true, {
        'fromDate': this.westDate(),
        'toDate': this.eastDate(),
        'data': this.data
    });
    document.dispatchEvent(evt);
};

Preview.prototype.dateRange = function () {
    var from = moment(this.westDate());
    var to = moment(this.eastDate()).add(1, 'days');
    var dateDiff = moment(to.diff(from));
    var numOfYears = dateDiff.diff(moment(0), 'years');
    var numOfYMonths = dateDiff.diff(moment(0), 'months') - (numOfYears * 12);
    return numOfYears + ' year(s), ' + numOfYMonths + ' month(s)';
};
