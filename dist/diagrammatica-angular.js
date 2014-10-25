"use strict";

angular.module("diagrammatica", []).factory("diagrammatica", [ "$window", function($window) {
    if (angular.isUndefined($window.diagrammatica)) {
        console.log("The Diagrammatica library is required.");
    }
    return $window.diagrammatica;
} ]);

"use strict";

angular.module("diagrammatica").directive("dmaHeatMap", [ "$window", "diagrammatica", function($window, diagrammatica) {
    return {
        restrict: "A",
        scope: {
            data: "=dmaHeatMap",
            from: "=?dmaHeatMapFrom",
            to: "=?dmaHeatMapTo",
            height: "=?dmaHeatMapHeight"
        },
        link: function(scope, element) {
            var chart = diagrammatica.heatMap(element[0], scope.data).width(element.width());
            $window.onresize = function() {
                scope.$apply();
            };
            scope.$watch(function() {
                return angular.element($window)[0].innerWidth;
            }, function() {
                chart.width(element.width())();
            });
            scope.$watch("height", function(newValue) {
                if (angular.isNumber(newValue)) {
                    chart.height(newValue)();
                }
            });
            var isValidValue = function(newValue, oldValue) {
                return angular.isDefined(newValue) && newValue !== oldValue;
            };
            scope.$watch("data", function(newValue, oldValue) {
                if (isValidValue(newValue, oldValue)) {
                    chart(newValue);
                }
            });
            scope.$watch("from", function(newValue, oldValue) {
                if (isValidValue(newValue, oldValue)) {
                    chart.fromX(newValue)();
                }
            });
            scope.$watch("to", function(newValue, oldValue) {
                if (isValidValue(newValue, oldValue)) {
                    chart.toX(newValue)();
                }
            });
        }
    };
} ]);

"use strict";

angular.module("diagrammatica").directive("dmaLineChart", [ "$window", "$document", "$timeout", "diagrammatica", function($window, $document, $timeout, diagrammatica) {
    return {
        restrict: "A",
        scope: {
            data: "=dmaLineChart",
            chartHeight: "=dmaChartHeight",
            fromDate: "=dmaFromDate",
            toDate: "=dmaToDate",
            legendWidth: "=dmaLegendWidth"
        },
        link: function(scope, element) {
            var chart = diagrammatica.line(element[0], scope.data).width(element.width());
            $window.onresize = function() {
                scope.$apply();
            };
            $document.bind("brushEvent", function(e) {
                var data = e.originalEvent.detail;
                if (data.data === scope.data) {
                    $timeout(function() {
                        scope.fromDate = data.fromDate;
                        scope.toDate = data.toDate;
                        scope.$apply();
                    });
                }
            });
            scope.$watch(function() {
                return angular.element($window)[0].innerWidth;
            }, function() {
                chart.width(element.width())();
            });
            scope.$watch("data", function(newValue, oldValue) {
                if (angular.isDefined(newValue) && newValue !== oldValue) {
                    chart(newValue);
                }
            });
            scope.$watch("legendWidth", function(newValue) {
                chart.rightMargin(newValue)();
            });
            scope.$watch("chartHeight", function(newValue) {
                chart.height(newValue);
            });
        }
    };
} ]);