'use strict';

describe('diagrammatica.heatMap', function () {
    var chart;
    var dataset;
    var fixture;
    var seriesNames;

    beforeEach(function () {
        seriesNames = ['Alpha', 'Beta'];
        dataset = [];
        angular.forEach(['Alpha', 'Beta'], function (category) {
            for (var i = 1; i <= 25; i++) {
                dataset.push({
                    category: category,
                    date: moment().add(i, 'month').toDate(),
                    value: 1
                });
            }
        });

        fixture = d3.select('body').append('div').classed('test-container', true);
        chart = heatMap(fixture, dataset);
    });

    afterEach(function () {
        fixture.remove();
    });

    it('should show years instead of months if more than 24 months', function () {
        var monthsInYear = 12;
        var expected = Math.ceil(dataset.length / seriesNames.length / monthsInYear) * seriesNames.length;

        var displayData = chart.displayData();

        expect(displayData.data.length).toEqual(expected);
    });
});
