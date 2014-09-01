'use strict';
angular.module('diagrammatica', [])
.factory('diagrammatica', ['$window', function ($window) {
    if (angular.isUndefined($window.diagrammatica)) {
        console.log('The Diagrammatica library is required.');
    }
    return $window.diagrammatica;
}]);
