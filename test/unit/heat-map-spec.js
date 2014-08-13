'use strict';

describe('diagrammatica.heatMap', function () {
    var chart;
    var dataset;
    var fixture;

    beforeEach(function () {
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
        var expected = [
            {category: 'Alpha', date: moment(2014, 'YYYY').toDate(), value: 4},
            {category: 'Alpha', date: moment(2015, 'YYYY').toDate(), value: 12},
            {category: 'Alpha', date: moment(2016, 'YYYY').toDate(), value: 9},
            {category: 'Beta', date: moment(2014, 'YYYY').toDate(), value: 4},
            {category: 'Beta', date: moment(2015, 'YYYY').toDate(), value: 12},
            {category: 'Beta', date: moment(2016, 'YYYY').toDate(), value: 9}
        ];

        var displayData = chart.displayData();

        expect(displayData.data).toEqual(expected);
    });
});
