'use strict';

describe('diagrammatica.bar', function () {
    var chart;
    var dataset;
    var fixture;

    beforeEach(function () {
        dataset = [
            {name: 'A', data: [2, 1, 5]},
            {name: 'B', data: [1, 4, 3]}
        ];
        fixture = d3.select('body').append('div').classed('test-container', true);
        chart = bar(fixture, dataset);
    });

    afterEach(function () {
        fixture.remove();
    });

    it('should set chart height when chart is created', function () {
        var expected = 150;

        var height = chart.height();

        expect(height).toEqual(expected);
    });

    it('should add bars to chart', function () {
        var bars = chart.bars();

        expect(bars[0].length).toBeGreaterThan(0);
        expect(bars[0].length).toEqual(dataset.length);
    });

    it('should set y axis label text', function () {
        var chartBase = chart.chartBase();
        spyOn(chartBase, 'yAxisLabelText');
        var expected = 'foo';

        chart.yAxisLabelText(expected);

        expect(chartBase.yAxisLabelText).toHaveBeenCalledWith(expected);
    });

    it('should set x axis label text', function () {
        var chartBase = chart.chartBase();
        spyOn(chartBase, 'xAxisLabelText');
        var expected = 'foo';

        chart.xAxisLabelText(expected);

        expect(chartBase.xAxisLabelText).toHaveBeenCalledWith(expected);
    });

    it('should set width', function () {
        var chartBase = chart.chartBase();
        spyOn(chartBase, 'width');
        var expected = 200;

        chart.width(expected);

        expect(chartBase.width).toHaveBeenCalledWith(expected, jasmine.any(Function));
    });
});
