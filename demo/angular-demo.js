angular.module('demo', ['diagrammatica'])
    .controller('MainCtrl', ['$scope', 'diagrammatica', function ($scope, diagrammatica) {
        var random = function () {
            return Math.floor(Math.random() * 100);
        };

        $scope.refresh = function () {
            $scope.data = [];
            angular.forEach(['Alpha', 'Beta', 'Gamma', 'Delta'], function (category) {
                for (var i = 1; i <= 24; i++) {
                    $scope.data.push({
                        category: category,
                        date: moment().add(i, 'month').toDate(),
                        value: random()
                    });
                }
            });
            $scope.fromDate = $scope.data[0].date;
            $scope.toDate = $scope.data[$scope.data.length - 1].date;
        };

        $scope.downloadData = function () {
            diagrammatica.toCSV($scope.data, null, true);
        };

        $scope.refresh();
    }]);
