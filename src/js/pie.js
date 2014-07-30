'use strict';
/* global d3: false, check: false, ChartBase */
/* exported pie */
var pie = function (selection, data) {
    selection = check.string(selection) ? d3.select(selection) : selection;
    var chart = new ChartBase(selection, 'pie');
    var config = chart.config;
    chart.updateDimensions = function () {
        this.svg.attr('width', config.width).attr('height', config.height);
        chart.renderArea.attr('transform', 'translate(' + config.width / 2 + ',' + config.height / 2 + ')');
    };
    chart.updateDimensions();

    function outerRadius() {
        var outerRadiusMargin = -10;
        return (Math.min(config.width, config.height) / 2) + outerRadiusMargin;
    }

    var arc = d3.svg.arc()
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.population;
        });

    // ------------------------------------------------------------------------
    // SVG
    // ------------------------------------------------------------------------
    var updateRadius = function () {
        arc.outerRadius(outerRadius());
    };
    updateRadius();

    data.forEach(function (d) {
        d.population = +d.population;
    });

    var paths = chart.renderArea.selectAll('path')
        .data(pie(data))
        .enter().append('path')
        .attr('d', arc)
        .style('fill', function (d) {
            return chart.colors(d.data.age);
        })
        .each(function (d) {
            this.currentAngle = d;
        });

    var labels = chart.renderArea.selectAll('text')
        .data(pie(data))
        .enter().append('text')
        .attr('transform', function (d) {
            return 'translate(' + arc.centroid(d) + ')';
        })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(function (d) {
            return d.data.age;
        });

    var arcTween = function (a) {
        var i = d3.interpolate(this.currentAngle, a);
        this.currentAngle = i(0);
        return function (t) {
            return arc(i(t));
        };
    };

    // ------------------------------------------------------------------------
    // Update/re-render
    // ------------------------------------------------------------------------
    function update (newData) {
        data = check.defined(newData) ? newData : data;
        data.forEach(function (d) {
            d.population = +d.population;
        });
        paths.data(pie(data))
            .transition()
            .duration(500)
            .attrTween('d', arcTween);

        labels.data(pie(data))
            .transition()
            .duration(500)
            .attr('transform', function (d) {
                return 'translate(' + arc.centroid(d) + ')';
            })
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text(function (d) {
                return d.data.age;
            });
    }
    chart.update = update;

    // ------------------------------------------------------------------------
    // Properties
    // ------------------------------------------------------------------------
    update.width = function (value) {
        return chart.width(value, updateRadius);
    };

    update.height = function (value) {
        return chart.height(value, updateRadius);
    };

    return update;
};
