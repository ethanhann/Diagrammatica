'use strict';
/* global d3: false, ChartBase */
/* exported line */
var line = function (selection, data) {
    selection = check.string(selection) ? d3.select(selection) : selection;
    var chart = new ChartBase(selection, 'line');
    var config = chart.config;
    config.margin.bottom = 50;

    var parseDate = d3.time.format('%d-%b-%y').parse;
    var formatTime = d3.time.format('%e %B');

    // ------------------------------------------------------------------------
    // Scales and axes
    // ------------------------------------------------------------------------
    function updateX() {
        chart.xScale = d3.time.scale()
            .range([0, config.paddedWidth()]);
        chart.xAxis = d3.svg.axis()
            .scale(chart.xScale)
            .orient('bottom');
    }

    updateX();

    function updateY() {
        chart.yScale = d3.scale.linear()
            .range([config.paddedHeight(), 0]);
        chart.yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .orient('left');
    }

    updateY();

    // ------------------------------------------------------------------------
    // SVG
    // ------------------------------------------------------------------------
    var lineGenerator = d3.svg.line()
//        .interpolate('basis')
        .x(function (d) {
            return chart.xScale(d.x);
        })
        .y(function (d) {
            return chart.yScale(d.y);
        });

    data.forEach(function (series) {
        series.data.forEach(function (d) {
            d.x = parseDate(d.x);
            d.y = +d.y;
        });
    });

    chart.xScale.domain([
        d3.min(data, function (series) {
            return d3.min(series.data, function (d) {
                return d.x;
            });
        }),
        d3.max(data, function (series) {
            return d3.max(series.data, function (d) {
                return d.x;
            });
        })
    ]);
    chart.yScale.domain([
        d3.min(data, function (series) {
            return d3.min(series.data, function (d) {
                return d.y;
            });
        }),
        d3.max(data, function (series) {
            return d3.max(series.data, function (d) {
                return d.y;
            });
        })
    ]);

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

    var series = chart.renderArea.selectAll('series')
        .data(data)
        .enter().append('g')
        .attr('class', 'series');
    var lines = series.append('path')
        .attr('class', 'line')
        .attr('d', function (d) {
            return lineGenerator(d.data);
        })
        .style('stroke', function (d) {
            return chart.colors(d.name);
        });

    // ------------------------------------------------------------------------
    // Tooltip
    // ------------------------------------------------------------------------
    // Hover line.
    var hoverLineGroup = chart.renderArea.append('g')
        .attr('class', 'hover-line');

    var hoverLine = hoverLineGroup
        .append('line')
        .attr('x1', 0).attr('x2', 0)
        .attr('y1', 0).attr('y2', config.paddedHeight());

    hoverLine.style('opacity', 0);

    var tooltipRectangleGroup = chart.renderArea.append('g')
        .attr('class', 'tooltip-rect-group');

    var tooltip = d3.select('body').append('div')
        .attr('class', 'eeh-chart-tooltip eeh-chart-tooltip-content')
        .style('opacity', 0);

    config.tooltipHtml = function (points) {
        var html = '';
        points.forEach(function (d) {
            html += '<svg height="10" width="10"><rect height="10" width="10" fill="' + chart.colors(d.name) + '"></rect></svg>';
            html += '<span> ' + d.name + '</span> : ' + formatTime(d.x) + ' : ' + d.y + '<br>';
        });
        return html;
    };

    function renderTooltip(data) {
        hoverLine.attr('y2', config.paddedHeight());
        tooltipRectangleGroup.selectAll('.tooltip-rect').remove();
        var tooltipRectangleWidth = config.paddedWidth() / data.length;
        var tooltipRectangleOffset = tooltipRectangleWidth / 2;

        tooltipRectangleGroup.selectAll('.tooltip-rect')
            .data(data[0].data)
            .enter().append('rect')
            .attr('height', config.paddedHeight())
            .attr('width', tooltipRectangleWidth)
            .attr('opacity', 0)
            .classed('tooltip-rect', true)
            .attr('x', function (d) {
                return chart.xScale(d.x) - tooltipRectangleOffset;
            })
            .on('mouseover', function (d) {
                hoverLine.attr('x1', chart.xScale(d.x))
                    .attr('x2', chart.xScale(d.x))
                    .style('opacity', 1);
                tooltip.transition()
                    .style('opacity', 1);
                var rectBox = this.getBoundingClientRect();
                var tooltipBox = tooltip.node().getBoundingClientRect();
                var xPosition = rectBox.left + (rectBox.width / 2);
                // Shift tooltip left if hovering over last element, or right if it is over the first n - 1 elements
                xPosition += d === data[0].data[data[0].data.length - 1] ? -Math.abs(tooltipBox.width + 10) : 10;
                var points = data.map(function (series) {
                    var point = series.data.filter(function (datum) {
                        return datum.x.getTime() === d.x.getTime();
                    });
                    var seriesPoint = point.length === 1 ? point[0] : {};
                    seriesPoint.name = series.name;
                    return seriesPoint;
                });
                tooltip.html(config.tooltipHtml(points))
                    .style('left', xPosition + 'px')
                    .style('top', (d3.event.pageY) + 'px');
            })
            .on('mousemove', function () {
                tooltip.style('top', (d3.event.pageY) + 'px');
            })
            .on('mouseout', function () {
                hoverLine.style('opacity', 0);
                tooltip.style('opacity', 0);
            });
    }

    renderTooltip(data);

    // ------------------------------------------------------------------------
    // Legend
    // ------------------------------------------------------------------------
    var legendGroup = chart.renderArea.append('g')
        .attr('class', 'legend');

    function renderLegend(data) {
        var legendItemData = data.map(function (d) {
            return {name: d.name};
        });

        var selectedLegendItem;
        var legendItems = legendGroup.selectAll('g')
            .data(legendItemData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .on('mouseover', function (d) {
                legendItems.transition()
                    .attr('opacity', function (t) {
                        return d === t ? 1 : 0.3;
                    });
                lines.transition()
                    .attr('opacity', function (t) {
                        return d.name === t.name ? 1 : 0;
                    });
            })
            .on('mouseout', function () {
                if (check.object(selectedLegendItem)) {
                    legendItems.transition()
                        .attr('opacity', function (t) {
                            return t === selectedLegendItem ? 1 : 0.3;
                        });
                    lines.transition().attr('opacity', function (t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    legendItems.transition().attr('opacity', 1);
                    lines.transition().attr('opacity', 1);
                }
            })
            .on('click', function (d) {
                selectedLegendItem = selectedLegendItem === d ? null : d;
                if (check.object(selectedLegendItem)) {
                    lines.attr('opacity', function (t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    lines.attr('opacity', 1);
                }
            });

        legendItems.append('text')
            .text(function (d) {
                return d.name;
            })
            .each(function (d) {
                d.width = this.getBBox().width;
            });

        legendItems.append('rect')
            .attr('class', 'legend-item-swatch')
            .attr('height', 10)
            .attr('width', 10)
            .attr('x', -12)
            .attr('y', -10)
            .attr('fill', function (d) {
                return chart.colors(d.name);
            });

        var xOffset = 0;
        legendItems.attr('transform', function (d, i) {
            xOffset += i > 0 ? legendItemData[i - 1].width + 20 : 0;
            return 'translate(' + xOffset + ',0)';
        });

        if (!chart.hasRenderedOnce) {
            legendGroup.attr('transform', 'translate(' + [(config.paddedWidth() - legendGroup.node().getBBox().width) / 2, config.height - 25].join() + ')');
        } else {
            legendGroup.transition()
                .duration(1000)
                .attr('transform', 'translate(' + [(config.paddedWidth() - legendGroup.node().getBBox().width) / 2, config.height - 25].join() + ')');
        }
    }

    renderLegend(data);

    // ------------------------------------------------------------------------
    // Update/re-render
    // ------------------------------------------------------------------------
    function update(data) {
        data.forEach(function (series) {
            series.data.forEach(function (d) {
                d.x = parseDate(d.x);
                d.y = +d.y;
            });
        });

        chart.xScale.domain([
            d3.min(data, function (series) {
                return d3.min(series.data, function (d) {
                    return d.x;
                });
            }),
            d3.max(data, function (series) {
                return d3.max(series.data, function (d) {
                    return d.x;
                });
            })
        ]);
        chart.yScale.domain([
            d3.min(data, function (series) {
                return d3.min(series.data, function (d) {
                    return d.y;
                });
            }),
            d3.max(data, function (series) {
                return d3.max(series.data, function (d) {
                    return d.y;
                });
            })
        ]);

        series = series.data(data);
        series.exit().remove();
        series.enter().append('g')
            .attr('class', 'series')
            .append('path')
            .attr('d', function (d) {
                return lineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            })
            .attr('class', 'line');

        series.select('path')
            .transition()
            .duration(1000)
            .attr('d', function (d) {
                return lineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            });

        chart.renderArea.select('.x.axis')
            .transition()
            .duration(1000)
            .call(chart.xAxis)
            .attr('transform', 'translate(0,' + config.paddedHeight() + ')');

        chart.renderArea.select('.y.axis')
            .transition()
            .duration(1000)
            .call(chart.yAxis);

        renderTooltip(data);
        renderLegend(data);
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

    update.tooltipHtml = function (value) {
        return chart.tooltipHtml(value);
    };

    chart.hasRenderedOnce = true;
    return update;
};
