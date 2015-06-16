var app = angular.module('starter.controllers', []); 





/* 
    The Account controller deals with the user login via OAuth 
*/
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
                        console.log("ERROR: " + data);
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
    			console.log("ERROR:" + data); 
    		}); 
    }
    
});
/*
    The Scanner Controller deals with the barcode scanning and initial request to AWS 
*/
app.controller('ScannerController', function($scope, $cordovaBarcodeScanner, $state, $ionicLoading, $http, $cordovaGeolocation, $state){
    $scope.showLocationResult = false;
    product.barcode = "B00QVGFOBM"; // Remove barcode string 
	this.scanBarcode = function() {
        
        // Use cordova to perform the barcode scan from device camera 
	    $cordovaBarcodeScanner.scan().then(function(imageData) {
            $ionicLoading.show(loadingOptions);
            $scope.reset(); 
	    	product.barcode = imageData.text;
                // Post to server which will make the AWS product request 
	    	    $http({
                    method: "post",
                    url: BASE_URL + "Logic/amazon/index.php", 
                    data: {
                        number: product.barcode
                    },
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .success(function(data) {
                    // Now we have amazon data, set the display 
                    $ionicLoading.hide(); 
                    product.pTitle = data.title[0];
                    $scope.pTitle = product.pTitle; 
                    $scope.infocard = true; 
                    $scope.priceEntry = true; 
                    product.imageUrl = data.imageUrl[0];
                    product.description = data.description[0]; 
                    product.asin = data.asin[0]; 
                    product.iframe = data.iFrameUrl[0]; 
                    $scope.asin = product.asin; 
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
	        console.log("Error. Could not read barcode."); 
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
        $scope.showLocation = false; 
        $scope.submitButtons = true; 
    }

    /*  
        Submit the entered user info to database 
    */ 
    $scope.submitInfo = function(){ 
        var userdata = {
            email: USER_EMAIL,
            product: product.barcode,
            productName: product.pTitle, 
            amazonPrice: product.price, 
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
        $scope.reset(); 
        $scope.infocard = false; 
        $scope.priceEntry = false; 
        localPrices = {}; 
        $state.go("tab.product");
    }
    /*
        Reset the display 
    */
    $scope.reset = function(){ 

        $scope.submitButtons = false; 
        $scope.priceEntry = true;
        $scope.showPrice = false; 
        $scope.location = {}; 
        $scope.showLocation = false; 
        $scope.showNewLocation = false; 
        $scope.money = ''; 
    }

    /* 
        Funtion to grab the stores near to the user 
    */
    var showNearby = function(){
        $ionicLoading.show(loadingOptions);
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        var lat; 
        var longi; 
        var latLong; 

        // Use cordova to get the current device GPS location 
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) { 
              lat = position.coords.latitude;
              longi = position.coords.longitude; 
              latLong = lat + "," + longi; 
                // Google Places API request 
                $http.get(
                    "https://maps.googleapis.com/maps/api/place/nearbysearch/" + 
                    "json?rankby=distance&types=book_store|" + 
                    "electronics_store" + 
                    "&location=" +
                    latLong + "&key=" + API_KEY)
                        .success(function(data){
                            $ionicLoading.hide(); 
                            $scope.results = data.results; 
                            // JSON of places available globally 
                            nearbyPlaces = data.results; 
                        }).error(function(err){
                            console.log(err); 
                });
            }, function(err) {
              console.log(err); 
        }); 
    }
}); 

/*
    The product controller deals with the places information and display of nearby places with prices 
    by comparing current location to price/location entries in the database. 
*/
app.controller("ProductController", function($sce, $scope, $cordovaBarcodeScanner, $http, $cordovaGeolocation, $ionicLoading, $state){
        // 

        $scope.pTitle = product.pTitle;
        $scope.imageUrl = product.imageUrl; 
        $scope.price = product.price;  
        $scope.description = product.description; 
        $scope.asin = product.asin; 
        $scope.iframe = function() {return $sce.trustAsResourceUrl(product.iframe);} 
        
        // Compare current location to location/price connections 
        var compareData = function(data){
            var result = []; 
            for(var i=0; i<data.length; i++){
                var entry = data[i]; 
                for(var j=0; j<nearbyPlaces.length; j++){
                    var locations = nearbyPlaces[j]; 
                    if(entry.store === locations.id){
                        result.push({
                            name: locations.name, 
                            price: entry.price, 
                            lat: locations.geometry.location.lat, 
                            lng: locations.geometry.location.lng
                        }); 
                    }
                }
            } 
            $scope.localPrices = result; 
            
        }

        $scope.setPlace = function(la, lo){ 
            currentLat = la; 
            currentLong = lo; 
            $state.go('map');   
        }

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
                
                console.log("Error: " + status); 
            });
        };


        $scope.goReviews = function(){

            $state.go('reviews'); 
        }

}); 
/* 
    Controller used to display target store on a map. 
*/
app.controller('MapController', function($scope, $ionicLoading) {
 
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var myLatlng = new google.maps.LatLng(currentLat, currentLong);
 
        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
 
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
        navigator.geolocation.getCurrentPosition(function(pos) {
            map.setCenter(new google.maps.LatLng(currentLat, currentLong));
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(currentLat, currentLong),
                map: map,
                title: "My Location"
            });
        });
 
        $scope.map = map;
    }); 

 
 
});
////////////// HELPER FUNCTIONS AND SETTINGS ///////////////////


var loadingOptions = {
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 150,
    showDelay: 0
}