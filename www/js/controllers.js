var app = angular.module('starter.controllers', [])


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
    			USER_EMAIL = data.data.email; 
                alert(USER_EMAIL); 
    		})
    		.error(function(data, status){
    			alert("ERROR:" + data); 
    		}); 
    }
    /*
    var adduser = function(){
        $http({
            method: "post",
            url: "http://127.0.0.1/adduser.php", 
            data: {
                email: USER_EMAIL
            }
        })
        .success(function(data) {
            alert(data); 
        })
        .error(function(data){
            alert(data)
        }); 
    }
    */
});

app.controller('ScannerController', function($scope, $cordovaBarcodeScanner, BarcodeService, $state){
	this.scanBarcode = function() {
	    $cordovaBarcodeScanner.scan().then(function(imageData) {
	    	BarcodeService.setBarcode(imageData.text); 
	    	$state.go('tab.product'); 
	   	}, function(error) {
	        alert("Error. Could not read barcode."); 
	    });
	}; 
}); 


app.controller("ProductController", function($scope, $cordovaBarcodeScanner, $http, BarcodeService, $cordovaGeolocation){
	var barcode = BarcodeService.getBarcode(); 
    $http({
		method: "post",
		url: "http://ec2-52-11-37-35.us-west-2.compute.amazonaws.com/Logic/amazon/index.php", 
		data: {
			number: barcode
		},
		headers: { 
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
	.success(function (data) {
		$scope.pTitle = data.title[0]; 
		$scope.imageUrl = data.imageUrl[0];
        if(data.price[0] === "N"){
            $scope.price = "Could not find an Amazon price for the selected item"
        }else{
            $scope.price = accounting.formatMoney((accounting.unformat(data.price[0]) * 1.37), "€", 2, ".", ",");    
        }
	});
    $scope.showNearby = function(){
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
                            $scope.results = data.results
                        }).error(function(err){
                            alert(err); 
                });
            }, function(err) {
              alert(err); 
        });
    }
}); 