angular.module('starter.services', [])

app.service("BarcodeService", function(){
  this.setBarcode = function(barcode){
    this.barcode = barcode; 
  }; 
  this.getBarcode = function(){
    return this.barcode; 
  }; 
}); 

