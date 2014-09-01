'use strict';

angular.module('diagrammatica')
.directive('dmaLineChart', ['$window', 'diagrammatica', function ($window, diagrammatica) {
    return {
        restrict: 'A',
        scope: {
            data: '=dmaLineChart'
        },
        link: function (scope, element) {
            var chart = diagrammatica.line(element[0], scope.data).width(element.width());
            $window.onresize = function () {
                scope.$apply();
            };
            scope.$watch(function () {
                return angular.element($window)[0].innerWidth;
            }, function () {
                chart.width(element.width())();
            });
            scope.$watch('data', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && newValue !== oldValue) {
                    chart(newValue);
                }
            });
        }
    };
}]);
