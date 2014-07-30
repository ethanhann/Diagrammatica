'use strict';

describe('d2c.line', function () {
    var chartBase;
    var dataset;
    var fixture;

    beforeEach(function () {
        dataset = [10, 20, 30, 40];
        fixture = d3.select('body').append('div').classed('test-container', true);
        chartBase = new ChartBase(fixture);
    });

    afterEach(function () {
        fixture.remove();
    });

    describe('axisLabelText', function () {
        var axisLabel;

        beforeEach(function () {
            axisLabel = chartBase.selection.append('g')
                .attr('class', 'y axis')
                .append('text')
                .attr('class', 'label');
        });

        it('should get empty string when there is no y axis label', function () {
            var expected = '';

            var result = chartBase.axisLabelText('y');

            expect(result).toEqual(expected);
        });

        it('should get y axis label text', function () {
            var expected = 'population';
            axisLabel.text(expected);

            var result = chartBase.axisLabelText('y');

            expect(result).toEqual(expected);
        });

        it('should set y axis label text', function () {
            var expected = 'population';

            chartBase.axisLabelText('y', expected);

            expect(chartBase.yAxisLabelText()).toEqual(expected);
        });

        it('should return update function when y axis label text is set', function () {
            var expected = 'population';

            var update = chartBase.axisLabelText('y', expected);

            expect(update).toBe(chartBase.update);
        });
    });

    describe('yAxisLabelText', function () {
        it('should call axisLabelText with y axisLetter and text', function () {
            var axisLetter = 'y';
            var expected = 'population';
            spyOn(chartBase, 'axisLabelText');

            chartBase.yAxisLabelText(expected);

            expect(chartBase.axisLabelText).toHaveBeenCalledWith(axisLetter, expected);
        });
    });

    describe('xAxisLabelText', function () {
        it('should call axisLabelText with x axisLetter and text', function () {
            var axisLetter = 'x';
            var expected = 'population';
            spyOn(chartBase, 'axisLabelText');

            chartBase.xAxisLabelText(expected);

            expect(chartBase.axisLabelText).toHaveBeenCalledWith(axisLetter, expected);
        });
    });

    describe('width', function () {
        it('should get width', function () {
            var expected = chartBase.config.width;

            var width = chartBase.width();

            expect(width).toEqual(expected);
        });

        it('should set width and call the axis update callback', function () {
            var expected = 9999;
            var args = { axisUpdateCallback: function () {} };
            spyOn(args, 'axisUpdateCallback');

            chartBase.width(expected, args.axisUpdateCallback);

            expect(chartBase.width()).toEqual(expected);
            expect(args.axisUpdateCallback).toHaveBeenCalled();
        });

        it('should set the width of the svg element ', function () {

        });
    });
});
