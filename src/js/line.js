'use strict';
/* global d3: false, ChartBase, tooltip, isD3Selection: false */
/* exported line */
var line = function (selection, data) {
    var self = this;
    self.data = data;
    selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
    var chart = new ChartBase(selection, 'line');
    var config = chart.config;
    config.margin.bottom = 70;
    config.margin2 = {top: 100, right: config.margin.right, bottom: 50, left: config.margin.left};
    config.height2 = function () {
        return config.height - config.margin2.top - config.margin2.bottom;
    };
    config.dotSize = 3;
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
        chart.x2Scale = d3.time.scale()
            .range([0, config.paddedWidth()]);
        chart.x2Axis = d3.svg.axis()
            .scale(chart.x2Scale)
            .orient('bottom');
    }

    updateX();

    function updateY() {
        chart.yScale = d3.scale.linear()
            .range([config.paddedHeight(), 0]);
        chart.y2Scale = d3.scale.linear()
            .range([config.margin.top, 0]);
        chart.yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .orient('left');
    }

    updateY();

    function brushed() {
        chart.xScale.domain(brush.empty() ? chart.x2Scale.domain() : brush.extent());
        series.selectAll('path').attr('d', function (d1) {
            return lineGenerator(d1.data);
        });
        chart.renderArea.select('.x.axis').call(chart.xAxis);
        series.selectAll('.dots')
            .attr('cx', function(d) {
                return chart.xScale(d.x);
            });
        renderTooltip(data);
    }

    // ------------------------------------------------------------------------
    // SVG
    // ------------------------------------------------------------------------
    var lineGenerator = d3.svg.line()
        .x(function (d) {
            return chart.xScale(d.x);
        })
        .y(function (d) {
            return chart.yScale(d.y);
        });
    var brushLineGenerator = d3.svg.line()
        .x(function (d) {
            return chart.xScale(d.x);
        })
        .y(function (d) {
            return chart.y2Scale(d.y / ( config.margin.bottom + config.margin.top ));
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

    chart.x2Scale.domain(chart.xScale.domain());
    chart.y2Scale.domain(chart.yScale.domain());

    var brush = d3.svg.brush()
        .x(chart.x2Scale)
        .on('brush', brushed)
        .extent([d3.min(data, function (series) {
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
    var clipping = chart.renderArea.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('transform', 'translate(' + config.dotSize * -1 + ',' + config.dotSize * -1 + ')')
        .attr('width', config.paddedWidth() + config.dotSize * 2)
        .attr('height', config.paddedHeight() + config.dotSize * 2);
    var focus = chart.renderArea.append('g')
        .attr('class', 'focus');
    focus.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + config.paddedHeight() + ')')
        .call(chart.xAxis)
        .append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'middle')
        .attr('x', config.paddedWidth() / 2)
        .attr('y', 28)
        .text('');
    focus.append('g')
        .attr('class', 'y axis')
        .call(chart.yAxis)
        .append('text')
        .attr('class', 'y label')
        .attr('transform', 'rotate(-90)')
        .attr('y', config.margin.left * -1)
        .attr('x', (config.paddedHeight() / 2) * -1)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('');    var context = chart.renderArea.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(0,' + (config.height2() + config.margin.top + config.margin.bottom) + ')');
    var series = focus.selectAll('series')
        .data(data)
        .enter().append('g')
        .attr('class', 'series');
    var lines = series.append('path')
        .attr('class', 'line')
        .attr('clip-path', 'url(#clip)')
        .attr('d', function (d) {
            return lineGenerator(d.data);
        })
        .style('stroke', function (d) {
            return chart.colors(d.name);
        });
    var dots = series.selectAll('dots')
        .data(function(d) {
            d.data.map(function (p) {
                p.name = d.name;
            });
            return d.data; })
        .enter().append('circle')
        .classed('dots', true)
        .attr('r', config.dotSize)
        .attr('clip-path', 'url(#clip)')
        .attr('cy', function(d) {
            return chart.yScale(d.y);
        })
        .attr('cx', function(d) {
            return chart.xScale(d.x);
        })
        .attr('fill', function (d) {
            return chart.colors(d.name);
        });
    var series2 = context.selectAll('series')
        .data(data)
        .enter().append('g')
        .attr('class', 'series');
    series2.append('path')
        .attr('class', 'line')
        .attr('d', function (d) {
            return brushLineGenerator(d.data);
        })
        .style('stroke', function (d) {
            return chart.colors(d.name);
        });
    context.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + config.margin.top  + ')')
        .call(chart.x2Axis);
    context.append('g')
        .attr('class', 'x brush')
        .call(brush)
        .selectAll('rect')
        .attr('y', -6)
        .attr('height', config.margin.top  + 7);


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

    config.tooltipHtml = function (points) {
        var html = '';
        html += '<div class="diagrammatica-tooltip-content">';
        html += points.length > 0 ? '<div class="diagrammatica-tooltip-title">' + formatTime(points[0].x) + '</div>' : '';
        points.forEach(function (d) {
            html += '<svg height="10" width="10"><rect height="10" width="10" fill="' + chart.colors(d.name) + '"></rect></svg>';
            html += '<span> ' + d.name + '</span> : ' + d.y + '<br>';
        });
        html += '</div>';
        return html;
    };

    function renderTooltip(data) {
        hoverLine.attr('y2', config.paddedHeight());
        tooltipRectangleGroup.selectAll('.tooltip-rect').remove();
        var xValueSet = d3.set(data.map(function(d) {
            return d.data;
        }).reduce(function (a, b) {
            return a.concat(b);
        }).map(function (d) {
            return d.x;
        })).values().map(function(x) {
            return new Date(x);
        });

        var tooltipRectangleWidth = config.paddedWidth() / xValueSet.length;
        var tooltipRectangleOffset = tooltipRectangleWidth / 2;
        tooltipRectangleGroup.selectAll('.tooltip-rect')
            .data(xValueSet)
            .enter().append('rect')
            .attr('height', config.paddedHeight())
            .attr('width', tooltipRectangleWidth)
            .attr('opacity', 0)
            .attr('clip-path', 'url(#clip)')
            .classed('tooltip-rect', true)
            .classed('diagrammatica-tooltip-target', true)
            .attr('x', function (x) {
                return chart.xScale(x) - tooltipRectangleOffset;
            })
            .on('mouseover', function (x) {
                hoverLine.attr('x1', chart.xScale(x))
                    .attr('x2', chart.xScale(x))
                    .attr('clip-path', 'url(#clip)')
                    .style('opacity', 1);
                tooltip.transition()
                    .style('opacity', 1);
                var rectBox = this.getBoundingClientRect();
                var tooltipBox = tooltip.node().getBoundingClientRect();
                var xPosition = rectBox.left + (rectBox.width / 2);
                // Shift tooltip left if hovering over last element, or right if it is over the first n - 1 elements
                xPosition += x === xValueSet.length[xValueSet.length - 1] ? -Math.abs(tooltipBox.width + 10) : 10;
                var points = data.map(function (series) {
                    var point = series.data.filter(function (datum) {
                        return datum.x.toString() === x.toString();
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
                dots.transition()
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
                    dots.transition().attr('opacity', function (t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    legendItems.transition().attr('opacity', 1);
                    lines.transition().attr('opacity', 1);
                    dots.transition().attr('opacity', 1);
                }
            })
            .on('click', function (d) {
                selectedLegendItem = selectedLegendItem === d ? null : d;
                if (check.object(selectedLegendItem)) {
                    lines.attr('opacity', function (t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                    dots.attr('opacity', function (t) {
                        return check.object(selectedLegendItem) && t.name === selectedLegendItem.name ? 1 : 0;
                    });
                } else {
                    lines.attr('opacity', 1);
                    dots.attr('opacity', 1);
                }
            });

        legendItems.append('text')
            .text(function (d) {
                return d.name;
            })
            .attr('transform', function(d, i) { return 'translate(0,' + i * 15 + ')'; })
            .each(function (d) {
                d.width = this.getBBox().width;
            });

        legendItems.append('rect')
            .attr('class', 'legend-item-swatch')
            .attr('height', 10)
            .attr('width', 10)
            .attr('x', -12)
            .attr('y', -10)
            .attr('transform', function(d, i) { return 'translate(0,' + i * 15 + ')'; })
            .attr('fill', function (d) {
                return chart.colors(d.name);
            });

        if (!chart.hasRenderedOnce) {
            legendGroup.attr('transform', 'translate('+ (config.paddedWidth() + 30) + ',0)');
        } else {
            legendGroup.transition()
                .duration(1000)
                .attr('transform', 'translate('+ (config.paddedWidth() + 30 ) + ',0)');
        }
    }

    renderLegend(data);

    // ------------------------------------------------------------------------
    // Update/re-render
    // ------------------------------------------------------------------------
    function update(newData) {
        data = self.data = check.defined(newData) ? newData : self.data;
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

        focus.select('.x.axis')
            .transition()
            .duration(1000)
            .call(chart.xAxis)
            .attr('transform', 'translate(0,' + config.paddedHeight() + ')');

        focus.select('.y.axis')
            .transition()
            .duration(1000)
            .call(chart.yAxis);

        series.selectAll('.dots')
            .data(function(d) {
                d.data.map(function (p) {
                    p.name = d.name;
                });
                return d.data; })
            .transition()
            .duration(1000)
            .attr('cy', function(d) {
                return chart.yScale(d.y);
            })
            .attr('cx', function(d) {
                return chart.xScale(d.x);
            });

        series2 = series2.data(data);
        series2.enter().append('g')
            .attr('class', 'series')
            .append('path')
            .attr('d', function (d) {
                return brushLineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            })
            .attr('class', 'line');
        series2.select('path')
            .transition()
            .duration(1000)
            .attr('d', function (d) {
                return brushLineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            });

        chart.x2Scale.domain(chart.xScale.domain());
        chart.y2Scale.domain(chart.yScale.domain());
        brush.x(chart.x2Scale)
            .extent([d3.min(data, function (series) {
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
        context.select('.x.brush')
            .transition()
            .duration(1000)
            .call(brush);
        context.select('.extent')
            .transition()
            .duration(1000)
            .attr('x', 0)
            .attr('width', config.paddedWidth());
        context.select('.resize.e')
            .attr('transform', 'translate(' + config.paddedWidth() + ',0)');
        context.select('.resize.w')
            .attr('transform', 'translate(0,0)');
        context.select('.x.axis')
            .transition()
            .duration(1000)
            .call(chart.x2Axis)
            .attr('transform', 'translate(0,' + config.margin.top  + ')');

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
            clipping.attr('width', config.paddedWidth() + config.dotSize * 2);
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
            clipping.attr('height', config.paddedHeight() + config.dotSize * 2);
            context.attr('transform', 'translate(0,' + (config.height2() + config.margin.top + config.margin.bottom) + ')');
            selection.select('.y.axis .label')
                .transition()
                .duration(1000)
                .attr('y', config.margin.left * -1)
                .attr('x', (config.paddedHeight() / 2) * -1);
            return update();
        });
    };

    update.rightMargin = function (value) {
        if (!arguments.length) {
            return chart.config.margin.right;
        }
        chart.config.margin.right = value;
        updateX();
        clipping.attr('width', config.paddedWidth() + config.dotSize * 2);
        renderTooltip(data);
        return update;
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
