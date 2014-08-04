angular.module('demo', []).controller('MainCtrl', ['$scope', function ($scope) {
    var random = function () {
        return Math.floor(Math.random() * 100);
    };
    $scope.refresh = function () {
        $scope.data = [
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
            {category: 'epsilon', date: new Date(2014, 1, 1), value: random()},
            {category: 'epsilon', date: new Date(2014, 2, 2), value: random()},
            {category: 'epsilon', date: new Date(2014, 3, 3), value: random()},
            {category: 'epsilon', date: new Date(2014, 4, 3), value: random()}
        ];
    };
    $scope.refresh();
}]);

angular.module('demo').directive('diagrammatica', ['$window', function ($window) {
    return {
        scope: {
            data: '=diagrammatica'
        },
        link: function (scope, element) {
            var chart = diagrammatica.heatMap(element[0], scope.data).width(element.width());

            // Browser onresize event
            $window.onresize = function () {
                scope.$apply();
            };

            // Watch for resize event
            scope.$watch(function () {
                return angular.element($window)[0].innerWidth;
            }, function () {
                chart.width(element.width())();
            });

            scope.$watch('data', function () {
                chart(scope.data);
            });
        }
    };
}]);
