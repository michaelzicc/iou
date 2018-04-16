

var app = angular.module('iouApp', []);
app.controller('iouCtrl', function($scope) {
	
	$scope.getIOUs = function()
	{
		console.log("getIOUs()");
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				var section = document.getElementById("ious");
				$scope.ious = angular.fromJson(xhr.responseText);
				console.log(xhr.responseText);
			}
		}
		xhr.open("POST", "/getIOUs", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify(firebase.auth().currentUser));
		
	}
});