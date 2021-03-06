// hagglr - this is the module declaration and states info. See controllers.js for controllers. 


///// GLOBAL SETTINGS //////
var requestToken = "";
var accessToken = "";
var clientId = "547116458961-7tsfii9mvd5cl5r9digh537n7vs0vqji.apps.googleusercontent.com";
var clientSecret = "v2Oo8y7W1M1lbM66vog4Mb6F";
var API_KEY = "AIzaSyBIgvJicny7Lult5CEGDYydJHmANgBIFxQ"
var BASE_URL = "http://www.hagglr.info/"
var USER_EMAIL = ""; 
var product = {}; 
var nearbyPlaces = {}; 
var localPrices = {}; 
var currentLat; 
var currentLong; 

angular.module('starter', [
                            'ionic', 
                            'starter.controllers', 
                            'starter.services', 
                            'ngCordova', 
                            'ui.router', 
                            ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html'
      }
    }
  })
  .state('tab.product', {
      cache: false, 
      url: '/product',
      views: {
        'tab-product': {
          templateUrl: 'templates/tab-product.html'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('reviews', {
    url: '/reviews', 
    templateUrl: 'templates/reviews.html'
      
  })

  .state('map', {
    url: '/map', 
    templateUrl: 'templates/map.html'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/account');

})


.config(['$ionicConfigProvider', function($ionicConfigProvider) {

$ionicConfigProvider.tabs.position('bottom'); //other values: top
$ionicConfigProvider.navBar.alignTitle('center');
}]);