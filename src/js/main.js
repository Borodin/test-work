'use strict';
/* Controllers */

var phonecatApp = angular.module('newsApp', []);

phonecatApp.controller('postListCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('test.json').success(function(data) {
        $scope.posts = data.values;
    });

    $scope.open = false;
    $scope.localStorage = window.localStorage;


    $scope.popup = function(post) {
        $scope.post = post;
        $scope.open = !!post;
        document.querySelector("#content").scrollTop = 0;

    };

    $scope.like = function(id, $event) {
    	localStorage[id] = localStorage[id]=="1"?"0":"1";
    	$event.stopPropagation();
    };
}]);