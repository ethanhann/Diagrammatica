angular.module("diagrammatica", []);

angular.module("diagrammatica").factory("diagrammatica", [ function() {
    "use strict";
    if (window.diagrammatica === undefined) {
        console.log("The Diagrammatica library is required.");
    }
    return window.diagrammatica;
} ]);

angular.module("diagrammatica").directive("dmaHeatMap", [ "$window", "diagrammatica", function($window, diagrammatica) {
    "use strict";
    return {
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
            scope.$watch("data", function() {
                chart(scope.data);
            });
            scope.$watch("from", function() {
                chart.fromX(scope.from)(scope.data);
            });
            scope.$watch("to", function() {
                chart.toX(scope.to)(scope.data);
            });
        }
    };
} ]);