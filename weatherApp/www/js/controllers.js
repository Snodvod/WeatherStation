var app = angular.module('companion', []);

app.factory('socket', function() {
	var socket = io.connect('http://localhost:3500');
	return socket;
});

app.controller('searchController', function($scope, $http, socket) {
	$scope.update = function() {
		$http.get('http://api.openweathermap.org/data/2.5/find?q=' + $scope.searchString + '&type=like&units=metric&appid=fd6b1187882bbd814406917225afe599').success(function(data, status, headers, config) {
			$scope.items = data.list;
		}).error(function(data, status, headers, config) {
		console.log("No data found...");
	});
	}

	$scope.selectCity = function(city) {
		console.log(city.name);
		$scope.activeCity = city;

		socket.emit('change', city)
	}
	
});

