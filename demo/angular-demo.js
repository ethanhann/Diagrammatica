angular.module('demo', ['diagrammatica']).controller('MainCtrl', ['$scope', function ($scope) {
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
    };
    $scope.refresh();
}]);
