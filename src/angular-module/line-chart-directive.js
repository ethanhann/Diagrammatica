'use strict';

angular.module('diagrammatica')
.directive('dmaLineChart', ['$window', 'diagrammatica', function ($window, diagrammatica) {
    return {
        restrict: 'A',
        scope: {
            data: '=dmaLineChart',
            legendWidth: '=dmaLegendWidth'
        },
        link: function (scope, element) {
            var chart = new diagrammatica.line(element[0], scope.data).width(element.width());
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
            scope.$watch('legendWidth', function (newValue) {
                chart.rightMargin(newValue)();
            });
        }
    };
}]);
