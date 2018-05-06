

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
				$scope.$digest();
			}
		}
		xhr.open("POST", "/getIOUs", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify(firebase.auth().currentUser));
		
	}
});

function mainApp(user)
{
	console.log("mainApp()");
	if(!user)
	{
		console.log("Empty User");
		document.getElementById("clientName").innerHTML = "";
		return;
	}
	//afterLogin();
	document.getElementById("clientName").innerHTML = user.displayName;
	console.log("user.email: " +user.email);
	//var token = document.getElementById("token");
	firebase.auth().currentUser.getIdToken(true)
		.then(function(idToken){
			//token.value = idToken;
			var scope = angular.element(document.getElementById("iouAApp")).scope();
			scope.$apply(function () {
				scope.getIOUs();
			});
		}).catch(function(error) {
			console.log("error getting token");
		});
}