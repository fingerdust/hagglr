var app = angular.module('starter.controllers', [])


app.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
}); 

app.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
}); 

app.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

app.controller('ScannerController', function($scope, $cordovaBarcodeScanner, BarcodeService, $state){
	this.scanBarcode = function() {
	    $cordovaBarcodeScanner.scan().then(function(imageData) {
	    	BarcodeService.setBarcode(imageData.text); 
	    	$state.go('tab.chats'); 
	   	}, function(error) {
	        alert("Error. Could not read barcode."); 
	    });
	}; 
}); 

app.service("BarcodeService", function(){
	this.setBarcode = function(barcode){
		this.barcode = barcode; 
	}; 
	this.getBarcode = function(){
		return this.barcode; 
	}; 
}); 

app.controller("ProductController", function($scope, $cordovaBarcodeScanner, $http, BarcodeService){
	var barcode = BarcodeService.getBarcode(); 
    $http({
		method: "post",
		url: "http://ec2-52-11-37-35.us-west-2.compute.amazonaws.com/Logic/amazon/index.php", 
		data: {
			number: "050644651557"
		},
		headers: { 
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
	.success(function (data) {
		$scope.pTitle = data.title[0]; 
		$scope.imageUrl = data.imageUrl[0];
	});
}); 