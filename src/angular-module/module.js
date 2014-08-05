angular.module("diagrammatica", []);

angular.module("diagrammatica").directive("dmaHeatMap", [ "$window", function($window) {
    return {
        scope: {
            data: "=dmaHeatMap"
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
        }
    };
} ]);
