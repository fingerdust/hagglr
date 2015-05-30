var app = angular.module('starter.controllers', []); 


app.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
}); 



app.controller('AccountCtrl', function($scope, $http, $state) {
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
                        $state.go("tab.dash");
                        
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
    			USER_EMAIL = data.data.email;              		
            })
    		.error(function(data, status){
    			alert("ERROR:" + data); 
    		}); 
    }
    
});

app.controller('ScannerController', function($scope, $cordovaBarcodeScanner, $state, $ionicLoading, $http, $cordovaGeolocation, $state){
    $scope.showLocationResult = false;
    product.barcode = "B00QVGFOBM"; // Remove barcode string 
	this.scanBarcode = function() {
        
	    /*REMOVE $cordovaBarcodeScanner.scan().then(function(imageData) {
            $ionicLoading.show(loadingOptions);
            $scope.reset(); 
	    	product.barcode = imageData.text; REMOVE*/
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
	   	/*REMOVE}, function(error) {
	        alert("Error. Could not read barcode."); 
	    });REMOVE*/
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
        $scope.showLocation = false; 
        $scope.submitButtons = true; 
    }
    $scope.submitInfo = function(){ 
        var userdata = {
            email: USER_EMAIL,
            product: product.barcode, 
            price: $scope.price, 
            store: $scope.location.id
        }; 
        $http({
            method: "post", 
            url: BASE_URL + "Data/index.php", 
            data: userdata
        })
        .success(function(data){
            console.log(data); 
        })
        .error(function(err){
            console.log(err); 
        }); 
        $state.go("tab.product");
    }
    $scope.reset = function(){ 

        $scope.submitButtons = false; 
        $scope.priceEntry = true;
        $scope.showPrice = false; 
        $scope.location = {}; 
        $scope.showLocation = false; 
        $scope.showNewLocation = false; 
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
                            $scope.results = data.results; 
                            nearbyPlaces = data.results; 
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
    $scope.getInfo = function(){
        userdata = {
            product: product.barcode
        }
        $http({
            method: "post", 
            url: BASE_URL + "Data/retrieve.php", 
            data: userdata
        })
        .success(function(data){
            compareData(data); 
        })
        .error(function(data, status){
            alert("Error: " + status); 
        });
    }
    var compareData = function(data){
        for(var i=0; i<data.length; i++){
            var prices = data[i]; 
            for(var j=0; j<nearbyPlaces.length; j++){
                var locations = nearbyPlaces[j]; 
                if(prices.store === locations.id){
                    alert(prices.price + locations.name); 
                }
            }
        }
    }
}); 

////////////// HELPER FUNCTIONS AND SETTINGS ///////////////////


var loadingOptions = {
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 150,
    showDelay: 0
}