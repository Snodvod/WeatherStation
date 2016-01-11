// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ionicApp', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.factory('socket', function() {
  var socket = io.connect('http://192.168.0.177:3500');
  return socket;
})


.factory('share', function() {
  var cityObj = [];
  var shareService = {};
  shareService.city = function() {
    console.log(cityObj);
    return cityObj;
  }
  shareService.changeCity = function(city) {
    cityObj = city;
  }
  return shareService;
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('active', {
    url: '/active',
    templateUrl: 'templates/active.html',
  })
  $stateProvider.state('search', {
    url: '/',
    templateUrl: 'templates/search.html',
  })

  $urlRouterProvider.otherwise('/');
})

.controller('activeController', function($scope, share) {
  console.log(share.city);
  $scope.activeCity = share.city;
})

.controller('searchController', function($scope, $http, socket, share) {
  var googleKey = 'AIzaSyAqqiEX1KSTglVMEetd76s5CIHkKtRqQZQ',
      weatherKey = 'fd6b1187882bbd814406917225afe599';
  console.log('searching');
  $scope.update = function() {
    $http.get('http://api.openweathermap.org/data/2.5/find?q=' + $scope.searchString + '&type=like&units=metric&appid='+weatherKey).success(function(data, status, headers, config) {
      $scope.items = data.list;
    }).error(function(data, status, headers, config) {
    console.log("No data found...");
  });
  }

  $scope.selectCity = function(city) {
    console.log(city.name);
    $scope.activeCity = city;
    share.changeCity(city);
    var timestamp = Date.now();
    var googlestamp = Math.floor(timestamp/1000);
    $http.get('https://maps.googleapis.com/maps/api/timezone/json?location='+city.coord.lat+','+city.coord.lon+'&timestamp='+googlestamp+'&key='+googleKey)
    .success(function(data, status, headers, config) {
      var stamp = (googlestamp+data.rawOffset)*1000;
      socket.emit('clock', stamp);
    }).error(function(data, status, headers, config) {
      console.log("Timezone error");
    });
    socket.emit('weather', city);
  }
  
})
