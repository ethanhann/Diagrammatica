'use strict';

angular.module('diagrammatica')
.directive('dmaLineChart', ['$window', '$document', '$timeout', 'diagrammatica', function ($window, $document, $timeout, diagrammatica) {
    return {
        restrict: 'A',
        scope: {
            data: '=dmaLineChart',
            chartHeight: '=dmaChartHeight',
            fromDate: '=dmaFromDate',
            toDate: '=dmaToDate',
            legendWidth: '=dmaLegendWidth'
        },
        link: function (scope, element) {
            var chart = diagrammatica.line(element[0], scope.data).width(element.width());
            $window.onresize = function () {
                scope.$apply();
            };
            $document.bind('brushEvent', function(e) {
                var data = e.originalEvent.detail;
                if (data.data === scope.data) {
                    $timeout(function () {
                        scope.fromDate = data.fromDate;
                        scope.toDate = data.toDate;
                        scope.$apply();
                    });
                }
            });
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
            scope.$watch('chartHeight', function (newValue) {
                chart.height(newValue);
            });
        }
    };
}]);
