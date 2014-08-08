(function (diagrammatica, jQuery) {
    'use strict';

    var random = function () {
        return Math.floor(Math.random() * 100);
    };
    var randomData = function (value) {
        var maxValue = value * 2;
        var data = [];
        var categories = ['A', 'B', 'C', 'D', 'E'];
        for (var i = 0; i < categories.length; i++) {
            data.push({
                name: categories[i],
                value: random() * maxValue
            });
        }
        return data;
    };

    //-------------------------------------------------------------------------
    // Bar Chart
    //-------------------------------------------------------------------------
    var barChart = diagrammatica.bar('#bar-chart1', randomData(1)).yAxisLabelText('some text');
    barChart();

    jQuery('#bar-chart1-reload').click(function () {
        barChart(randomData(1));
    });

    var verticalBarChart = diagrammatica.bar('#column-chart1', randomData(1), 'vertical');

    jQuery('#column-chart1-reload').click(function () {
        verticalBarChart(randomData(1));
    });

    //-------------------------------------------------------------------------
    // Pie Chart
    //-------------------------------------------------------------------------
    var pieChartData = function () {
        return [
            {age: 'A', population: random()},
            {age: 'B', population: random()},
            {age: 'C', population: random()},
            {age: 'D', population: random()}
        ];
    };
    var pieChart = diagrammatica.pie('#pie-chart1', pieChartData());
    jQuery('#pie-chart1-reload').click(function () {
        pieChart(pieChartData());
    });

    //-------------------------------------------------------------------------
    // Line Chart
    //-------------------------------------------------------------------------
    var lineChartData = function () {
        return [
            {
                name: 'series 1',
                data: [
                    {x: '1-May-12', y: random()},
                    {x: '2-May-12', y: random()},
                    {x: '3-May-12', y: random()},
                    {x: '4-May-12', y: random()},
                    {x: '5-May-12', y: random()}
                ]
            },
            {
                name: 'Series 2',
                data: [
                    {x: '1-May-12', y: random()},
                    {x: '2-May-12', y: random()},
                    {x: '3-May-12', y: random()},
                    {x: '4-May-12', y: random()},
                    {x: '5-May-12', y: random()}
                ]
            },
            {
                name: 'series 3',
                data: [
                    {x: '1-May-12', y: random()},
                    {x: '2-May-12', y: random()},
                    {x: '3-May-12', y: random()},
                    {x: '4-May-12', y: random()},
                    {x: '5-May-12', y: random()}
                ]
            }
        ];
    };
    var lineChart = diagrammatica.line('#line-chart1', lineChartData());
    jQuery('#line-chart1-reload').click(function () {
        lineChart(lineChartData());
    });

    //-------------------------------------------------------------------------
    // Heat Map Chart
    //-------------------------------------------------------------------------
    var heatMapData = function () {
        return [
            {category: 'alpha', date: new Date(2014, 1, 1), value: random()},
            {category: 'alpha', date: new Date(2014, 2, 2), value: random()},
            {category: 'alpha', date: new Date(2014, 3, 3), value: random()},
            {category: 'alpha', date: new Date(2014, 4, 3), value: random()},
            {category: 'beta', date: new Date(2014, 1, 1), value: random()},
            {category: 'beta', date: new Date(2014, 2, 2), value: random()},
            {category: 'beta', date: new Date(2014, 3, 3), value: random()},
            {category: 'beta', date: new Date(2014, 4, 3), value: random()},
            {category: 'gamma', date: new Date(2014, 1, 1), value: random()},
            {category: 'gamma', date: new Date(2014, 2, 2), value: random()},
            {category: 'gamma', date: new Date(2014, 3, 3), value: random()},
            {category: 'gamma', date: new Date(2014, 4, 3), value: random()},
            {category: 'delta', date: new Date(2014, 1, 1), value: random()},
            {category: 'delta', date: new Date(2014, 2, 2), value: random()},
            {category: 'delta', date: new Date(2014, 3, 3), value: random()},
            {category: 'delta', date: new Date(2014, 4, 3), value: random()}
        ];
    };
    var heatMap = diagrammatica.heatMap('#heat-map-chart1', heatMapData());
    jQuery('#heat-map-chart1-reload').click(function () {
        heatMap(heatMapData());
    });

})(diagrammatica, jQuery);
