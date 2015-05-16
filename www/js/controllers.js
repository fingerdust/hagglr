var app = angular.module('starter.controllers', []); 


app.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
}); 



app.controller('AccountCtrl', function($scope, $http, $location) {
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
 
    $scope.login = function() {
        
        var ref = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/userinfo.email&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no');
        ref.addEventListener('loadstart', function(event) { 
            if((event.url).startsWith("http://localhost/callback")) {
                requestToken = (event.url).split("code=")[1];
                $http({method: "post", url: "https://accounts.google.com/o/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
                    .success(function(data) {
                        accessToken = data.access_token;
                        initUserData(accessToken); 
                        $location.path("/account");
                        
                    })
                    .error(function(data, status) {
                        alert("ERROR: " + data);
                    });
                ref.close();
            }
        });
    }
 
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }

    var initUserData = function(accessToken){
    	$http.get("https://www.googleapis.com/userinfo/email?alt=json&access_token=" + accessToken)
    		.success(function(data){
                alert("inside init"); 
    			USER_EMAIL = data.data.email; 
                alert(USER_EMAIL); 
                var data = {email: data.data.email}; 
                var res = $http.post(BASE_URL + 'Data/index.php', data);    
                res.success(function(data, status, headers, config) {
                    console.log("User email saved to database"); 
                });              		
            })
    		.error(function(data, status){
    			alert("ERROR:" + data); 
    		}); 
    }
    
});

app.controller('ScannerController', function($scope, $cordovaBarcodeScanner, $state, $ionicLoading, $http, $cordovaGeolocation){
    $scope.showLocationResult = false;
	this.scanBarcode = function() {
	    $cordovaBarcodeScanner.scan().then(function(imageData) {
            $ionicLoading.show(loadingOptions);
	    	var barcode = imageData.text; 
	    	    $http({
                    method: "post",
                    url: BASE_URL + "Logic/amazon/index.php", 
                    data: {
                        number: "B00QVGFOBM"
                    },
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .success(function(data) {
                    $ionicLoading.hide(); 
                    product.pTitle = data.title[0];
                    $scope.pTitle = product.pTitle; 
                    $scope.infocard = true; 
                    $scope.priceEntry = true; 
                    product.imageUrl = data.imageUrl[0];
                    product.description = data.description[0]; 
                    if(data.price[0] === "N"){
                        product.price = "Could not find an Amazon price for the selected item"
                    }else{
                        product.price = accounting.formatMoney((accounting.unformat(data.price[0]) * 1.37), "€", 2, ".", ",");    
                    }
                })
                .error(function(data){
                    alert("Could not find product information"); 
                });
	   	}, function(error) {
	        alert("Error. Could not read barcode."); 
	    });
	}
    $scope.submitPrice = function(){
        $scope.price = document.getElementById("price").value; 
        $scope.priceEntry = false; 
        $scope.showPrice = true; 
        showNearby(); 
        $scope.showLocation = true; 
    }

    $scope.newLocation = function(){
        $scope.showNewLocation = true; 
    }

    var showNearby = function(){
        $ionicLoading.show(loadingOptions);
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        var lat; 
        var longi; 
        var latLong; 
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
              lat = position.coords.latitude;
              longi = position.coords.longitude;
              latLong = lat + "," + longi; 
                $http.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?rankby=distance&type=store&location=" +
                    latLong + "&key=" + API_KEY)
                        .success(function(data){
                            $ionicLoading.hide(); 
                            $scope.results = data.results

                        }).error(function(err){
                            alert(err); 
                });
            }, function(err) {
              alert(err); 
        });
    }
}); 


app.controller("ProductController", function($scope, $cordovaBarcodeScanner, $http, $cordovaGeolocation, $ionicLoading){
    $scope.pTitle = product.pTitle;
    $scope.imageUrl = product.imageUrl; 
    $scope.price = product.price;  
    $scope.description = product.description; 
    $scope.showNearby = function(){
        $ionicLoading.show(loadingOptions);
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        var lat; 
        var longi; 
        var latLong; 
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
              lat = position.coords.latitude;
              longi = position.coords.longitude;
              latLong = lat + "," + longi; 
                $http.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?rankby=distance&type=store&location=" +
                    latLong + "&key=" + API_KEY)
                        .success(function(data){
                            $ionicLoading.hide();
                            $scope.results = data.results

                        }).error(function(err){
                            alert(err); 
                });
            }, function(err) {
              alert(err); 
        });
    }
}); 

////////////// HELPER FUNCTIONS AND SETTINGS ///////////////////


var loadingOptions = {
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
}