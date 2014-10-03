angular.module('demo', ['diagrammatica'])
.controller('MainCtrl', ['$scope', 'diagrammatica', function ($scope, diagrammatica) {
    var random = function () {
        return Math.floor(Math.random() * 100);
    };
    $scope.heatMapHeight = 225;
    $scope.refreshHeatMapData = function () {
        $scope.heatMapData = [];
        angular.forEach(['Alpha', 'Beta', 'Gamma', 'Delta'], function (category) {
            for (var i = 1; i <= 24; i++) {
                $scope.heatMapData.push({
                    category: category,
                    date: moment().add(i, 'month').toDate(),
                    value: random()
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

    $scope.refreshLineChartData = function () {
        $scope.lineChartData = [
            { name: 'series 1', data: [] },
            { name: 'series 2', data: [] },
            { name: 'series 3', data: [] }
        ];
        var pointCount = 20;
        $scope.lineChartData.forEach(function (series) {
            var dateCounter = moment();
            dateCounter.startOf('day');
            for (var i = 0 ; i < pointCount; i++) {
                series.data.push({
                    x: dateCounter.clone().toDate(),
                    y: random()
                });
                dateCounter = dateCounter.add(1, 'day');
            }
        });

    };
    $scope.refreshLineChartData();
}]);
