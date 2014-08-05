angular.module('demo', ['diagrammatica'], function () {}).controller('MainCtrl', ['$scope', function ($scope) {
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
