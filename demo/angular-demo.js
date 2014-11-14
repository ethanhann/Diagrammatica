(function (angular, moment) {
    'use strict';
    angular.module('demo', ['diagrammatica'])
    .factory('randomNumber', function () {
        return function () {
            return Math.floor(Math.random() * 100);
        };
    })
    .controller('HeatMapCtrl', ['$scope', 'diagrammatica', 'randomNumber', function ($scope, diagrammatica, randomNumber) {
        $scope.heatMapHeight = 225;
        $scope.refreshHeatMapData = function () {
            $scope.heatMapData = [];
            angular.forEach(['Alpha', 'Beta', 'Gamma', 'Delta'], function (category) {
                for (var i = 1; i <= 24; i++) {
                    $scope.heatMapData.push({
                        category: category,
                        date: moment().add(i, 'month').toDate(),
                        value: randomNumber()
                    });
                }
            });
            $scope.fromDate = $scope.heatMapData[0].date;
            $scope.toDate = $scope.heatMapData[$scope.heatMapData.length - 1].date;
        };

        $scope.downloadData = function () {
            diagrammatica.toCSV($scope.heatMapData, null, true);
        };
        $scope.refreshHeatMapData();
    }])
    .controller('LineChartCtrl', ['$scope', 'diagrammatica', 'randomNumber', function ($scope, diagrammatica, randomNumber) {
        $scope.refreshLineChartData = function () {
            $scope.lineChartData = [
                {name: 'series 1', data: []},
                {name: 'series 2', data: []},
                {name: 'series 3', data: []}
            ];
            var pointCount = 60;
            $scope.lineChartData.forEach(function (series) {
                var dateCounter = moment();
                dateCounter.startOf('month');
                for (var i = 0; i <= pointCount; i++) {
                    series.data.push({
                        x: dateCounter.clone().toDate(),
                        y: randomNumber()
                    });
                    dateCounter = dateCounter.add(1, 'month');
                }
            });

        };
        $scope.refreshLineChartData();
    }]);
})(angular, moment);
