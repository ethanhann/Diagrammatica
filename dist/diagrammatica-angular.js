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
            to: "=?dmaHeatMapTo"
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

angular.module("diagrammatica").directive("dmaLineChart", [ "$window", "diagrammatica", function($window, diagrammatica) {
    return {
        restrict: "A",
        scope: {
            data: "=dmaLineChart"
        },
        link: function(scope, element) {
            var chart = diagrammatica.line(element[0], scope.data).width(element.width());
            $window.onresize = function() {
                scope.$apply();
            };
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
        }
    };
} ]);