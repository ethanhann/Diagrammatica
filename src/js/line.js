'use strict';
/* global d3: false, ChartBase, tooltip, isD3Selection: false, moment: false */
/* exported line */
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
    var to = moment(this.eastDate());
    var dateDiff = moment(to.diff(from));
    var numOfYears = dateDiff.diff(moment(0), 'years');
    var numOfYMonths = dateDiff.diff(moment(0), 'months') - (numOfYears * 12);
    return numOfYears + ' year(s), ' + numOfYMonths + ' month(s)';
};

function LineBase(selection, data) {
    var self = this;
    self.data = data;
    selection = this.selection = isD3Selection(selection) ? selection : d3.select(selection);
    var chart = this.chart = new ChartBase(selection, 'line');
    var config = chart.config;
    config.margin.bottom = 100;
    config.margin.top = 25;
    config.margin.right = 80;
    config.dotSize = 3;
    var textTimeFormat = this.textTimeFormat = d3.time.format('%B %Y');

    var preview = this.preview = new Preview(chart, data, this.textTimeFormat);

    // ------------------------------------------------------------------------
    // Scales and axes
    // ------------------------------------------------------------------------
    this.updateX();
    this.updateY();


    // ------------------------------------------------------------------------
    // SVG
    // ------------------------------------------------------------------------
    var lineGenerator = this.lineGenerator = d3.svg.line()
        .x(function (d) {
            return chart.xScale(d.x);
        })
        .y(function (d) {
            return chart.yScale(d.y);
        });
    var brushLineGenerator = this.brushLineGenerator = d3.svg.line()
        .x(function (d) {
            return chart.xScale(d.x);
        })
        .y(function (d) {
            return preview.chart.yScale(d.y * 0.9);
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

    preview.chart.xScale.domain(chart.xScale.domain());

    // ------------------------------------------------------------------------
    // Brush
    // ------------------------------------------------------------------------
    preview.brush = d3.svg.brush()
        .x(this.chart.xScale)
        .on('brush', function () {
            chart.xScale.domain(preview.brush.empty() ? preview.chart.xScale.domain() : preview.brush.extent());
            series.selectAll('path').attr('d', function (d1) {
                return lineGenerator(d1.data);
            });
            chart.renderArea.select('.x.axis').call(chart.xAxis);
            series.selectAll('.dots')
                .attr('cx', function (d) {
                    return chart.xScale(d.x);
                });
            renderTooltip(data);
            preview.sendPreview();
        })
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

    preview.uniqueClipId = 'clip' + (preview.eastDate() - preview.westDate());
    preview.range = chart.renderArea.append('g');
    preview.range.append('text')
        .attr('id', 'fromDate')
        .text(textTimeFormat(preview.westDate()))
        .attr('transform', 'translate(0,-5)')
        .style('text-anchor', 'start')
        .style('font-weight', 'bold');
    preview.range.append('text')
        .attr('id', 'toDate')
        .text(textTimeFormat(preview.eastDate()))
        .attr('transform', 'translate(0,-5)')
        .style('text-anchor', 'end')
        .style('font-weight', 'bold');
    preview.range.append('text')
        .attr('id', 'range')
        .text(preview.dateRange())
        .attr('transform', 'translate(0,-5)')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold');
    preview.clipping = chart.renderArea.append('defs').append('clipPath')
        .attr('id', preview.uniqueClipId)
        .append('rect')
        .attr('transform', 'translate(' + config.dotSize * -1 + ',' + config.dotSize * -1 + ')')
        .attr('width', config.paddedWidth() + config.dotSize * 2)
        .attr('height', config.paddedHeight() + config.dotSize * 2);
    var focus = this.focus = chart.renderArea.append('g')
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
        .text('');
    var context = this.context = chart.renderArea.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(0,' + preview.config.height() + ')');
    var series = this.series = focus.selectAll('series')
        .data(data)
        .enter().append('g')
        .attr('class', 'series');

    // Render lines
    var lines = series.append('path')
        .attr('class', 'line')
        .attr('clip-path', 'url(#' + preview.uniqueClipId + ')')
        .attr('d', function (d) {
            return lineGenerator(d.data);
        })
        .style('stroke', function (d) {
            return chart.colors(d.name);
        });

    // Render dots
    var dots = series.selectAll('dots')
        .data(function (d) {
            d.data.map(function (p) {
                p.name = d.name;
            });
            return d.data;
        })
        .enter().append('circle')
        .classed('dots', true)
        .attr('r', config.dotSize)
        .attr('clip-path', 'url(#' + preview.uniqueClipId + ')')
        .attr('cy', function (d) {
            return chart.yScale(d.y);
        })
        .attr('cx', function (d) {
            return chart.xScale(d.x);
        })
        .attr('fill', function (d) {
            return chart.colors(d.name);
        });

    preview.series = context.selectAll('series')
        .data(data)
        .enter().append('g')
        .attr('class', 'series');
    preview.series.append('path')
        .attr('class', 'line')
        .attr('d', function (d) {
            return brushLineGenerator(d.data);
        })
        .style('stroke', function (d) {
            return chart.colors(d.name);
        });
    context.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + (config.paddedWidth() * -1) + ',' + preview.config.height() + ')')
        .call(preview.chart.xAxis);
    context.append('g')
        .attr('class', 'x brush')
        .call(preview.brush)
        .selectAll('rect')
        .attr('height', preview.config.height());
    context.selectAll('.resize')
        .append('rect')
        .attr('x', -3)
        .attr('y', 0)
        .attr('width', 6)
        .attr('class', 'handle');


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
        html += points.length > 0 ? '<div class="diagrammatica-tooltip-title">' + textTimeFormat(points[0].x) + '</div>' : '';
        points.forEach(function (d) {
            html += '<svg height="10" width="10"><rect height="10" width="10" fill="' + chart.colors(d.name) + '"></rect></svg>';
            html += '<span> ' + d.name + '</span> : ' + d.y + '<br>';
        });
        html += '</div>';
        return html;
    };

    var renderTooltip = this.renderTooltip = function (data) {
        hoverLine.attr('y2', config.paddedHeight());
        tooltipRectangleGroup.selectAll('.tooltip-rect').remove();
        var xValueSet = d3.set(data.map(function (d) {
            return d.data;
        }).reduce(function (a, b) {
            return a.concat(b);
        }).map(function (d) {
            return d.x;
        })).values().map(function (x) {
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
            .attr('clip-path', 'url(#' + preview.uniqueClipId + ')')
            .classed('tooltip-rect', true)
            .classed('diagrammatica-tooltip-target', true)
            .attr('x', function (x) {
                return chart.xScale(x) - tooltipRectangleOffset;
            })
            .on('mouseover', function (x) {
                hoverLine.attr('x1', chart.xScale(x))
                    .attr('x2', chart.xScale(x))
                    .attr('clip-path', 'url(#' + preview.uniqueClipId + ')')
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

                dots.transition()
                    .attr('cy', function (d) {
                        return chart.yScale(d.y);
                    })
                    .attr('cx', function (d) {
                        return chart.xScale(d.x);
                    })
                    .attr('r', function (t) {
                        var grow = points.filter(function (d) {
                            return t === d;
                        });
                        return grow.length > 0 ? config.dotSize * 2 : config.dotSize;
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
                dots.transition()
                    .attr('cy', function (d) {
                        return chart.yScale(d.y);
                    })
                    .attr('cx', function (d) {
                        return chart.xScale(d.x);
                    })
                    .attr('r', config.dotSize);
            });
    };

    renderTooltip(data);
    // ------------------------------------------------------------------------
    // Legend
    // ------------------------------------------------------------------------
    var legendGroup = chart.renderArea.append('g')
        .attr('class', 'legend');

    var renderLegend = this.renderLegend = function (data) {
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
                    renderTooltip(data.filter(function (l) {
                        return l.name === selectedLegendItem.name;
                    }));
                } else {
                    lines.attr('opacity', 1);
                    dots.attr('opacity', 1);
                    renderTooltip(data);
                }
            });

        legendItems.append('text')
            .text(function (d) {
                return d.name;
            })
            .attr('transform', function (d, i) {
                return 'translate(0,' + i * 15 + ')';
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
            .attr('transform', function (d, i) {
                return 'translate(0,' + i * 15 + ')';
            })
            .attr('fill', function (d) {
                return chart.colors(d.name);
            });

        if (!chart.hasRenderedOnce) {
            legendGroup.attr('transform', 'translate(' + (config.paddedWidth() + 35) + ',0)');
        } else {
            legendGroup.transition()
                .duration(config.transitionDuration)
                .attr('transform', 'translate(' + (config.paddedWidth() + 35 ) + ',0)');
        }
    };

    renderLegend(data);
    preview.sendPreview();
}

LineBase.prototype.updateX = function () {
    var chart = this.chart;
    var config = this.chart.config;
    var preview = this.preview;
    chart.xScale = d3.time.scale()
        .range([0, config.paddedWidth()]);
    chart.xAxis = d3.svg.axis()
        .scale(chart.xScale)
        .orient('bottom');
    preview.chart.xScale = d3.time.scale()
        .range([0, config.paddedWidth()]);
    preview.chart.xAxis = d3.svg.axis()
        .scale(preview.chart.xScale)
        .orient('bottom');
};

LineBase.prototype.updateY = function () {
    var chart = this.chart;
    var config = this.chart.config;
    var preview = this.preview;
    var data = this.data;
    chart.yScale = d3.scale.linear()
        .range([config.paddedHeight(), 0]);
    preview.chart.yScale = d3.scale.linear()
        .range([preview.config.height(), 0])
        .domain([0, d3.max(data, function (series) {
            return d3.max(series.data, function (d) {
                return d.y;
            });
        })]);
    chart.yAxis = d3.svg.axis()
        .scale(chart.yScale)
        .orient('left');
};

var line = function (selection, data) {
    var lineBase = new LineBase(selection, data);
    var chart = lineBase.chart;
    var config = chart.config;
    var preview = lineBase.preview;
    var lineGenerator = lineBase.lineGenerator;
    var brushLineGenerator = lineBase.brushLineGenerator;
    var series = lineBase.series;
    var focus = lineBase.focus;
    var context = lineBase.context;
    var updateX = lineBase.updateX;
    var updateY = lineBase.updateY;
    var renderTooltip = lineBase.renderTooltip;
    var renderLegend = lineBase.renderLegend;


    function update(newData) {
        data = check.defined(newData) ? newData : data;
        // Rescale
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

        // Update lines
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
            });
        series.select('path')
            .transition()
            .duration(config.transitionDuration)
            .attr('d', function (d) {
                return lineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            });

        focus.select('.x.axis')
            .transition()
            .duration(config.transitionDuration)
            .call(chart.xAxis)
            .attr('transform', 'translate(0,' + config.paddedHeight() + ')');

        focus.select('.y.axis')
            .transition()
            .duration(config.transitionDuration)
            .call(chart.yAxis);

        series.selectAll('.dots')
            .data(function (d) {
                d.data.map(function (p) {
                    p.name = d.name;
                });
                return d.data;
            })
            .transition()
            .duration(config.transitionDuration)
            .attr('cy', function (d) {
                return chart.yScale(d.y);
            })
            .attr('cx', function (d) {
                return chart.xScale(d.x);
            });

        // Update brush
        preview.series = preview.series.data(data);
        preview.series.enter().append('g')
            .attr('class', 'series')
            .append('path')
            .attr('d', function (d) {
                return brushLineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            })
            .attr('class', 'line');
        preview.series.select('path')
            .transition()
            .duration(config.transitionDuration)
            .attr('d', function (d) {
                return brushLineGenerator(d.data);
            })
            .style('stroke', function (d) {
                return chart.colors(d.name);
            });

        preview.chart.xScale.domain(chart.xScale.domain());
        preview.brush.x(preview.chart.xScale)
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
        context.attr('transform', 'translate(0,' + (config.paddedHeight() + preview.config.margin.bottom + 4) + ')');
        context.select('.x.brush')
            .transition()
            .duration(config.transitionDuration)
            .call(preview.brush);
        context.select('.extent')
            .transition()
            .duration(config.transitionDuration)
            .attr('x', 0)
            .attr('width', config.paddedWidth());
        context.select('.resize.e')
            .transition()
            .duration(config.transitionDuration)
            .attr('transform', 'translate(' + config.paddedWidth() + ',0)');
        context.select('.resize.w')
            .transition()
            .duration(config.transitionDuration)
            .attr('transform', 'translate(0,0)');
        context.select('.x.axis')
            .transition()
            .duration(config.transitionDuration)
            .call(preview.chart.xAxis)
            .attr('transform', 'translate(0,' + preview.config.height() + ')');

        renderTooltip(data);
        renderLegend(data);
        lineBase.preview.sendPreview();
    }

    chart.update = update;
    //update();
    // ------------------------------------------------------------------------
    // Properties
    // ------------------------------------------------------------------------
    update.width = function (value) {
        return chart.width(value, function () {
            updateX();
            preview.clipping.attr('width', config.paddedWidth() + config.dotSize * 2);
            lineBase.selection.select('.x.axis .label')
                .transition()
                .duration(config.transitionDuration)
                .attr('x', config.paddedWidth() / 2)
                .attr('y', 28);
        });
    };

    update.height = function (value) {
        return chart.height(value, function () {
            updateY();
            preview.clipping.attr('height', config.paddedHeight() + config.dotSize * 2);
            context.attr('transform', 'translate(0,' + preview.config.height() + ')');
            context.select('.x.brush')
                .selectAll('rect')
                .attr('height', (preview.config.height() - 5))
                .attr('transform', 'translate(0,' + 5 + ')');
            lineBase.selection.select('.y.axis .label')
                .transition()
                .duration(config.transitionDuration)
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
        preview.clipping.attr('width', config.paddedWidth() + config.dotSize * 2);
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