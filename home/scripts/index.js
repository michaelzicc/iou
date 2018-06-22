var app = angular.module('iouApp', []);
var cf;
var cfLoggedIn = false;

app.controller('iouCtrl', function($scope) {
	cf = this;
	
	$scope.loggedIn = false;
	
	cf.setLoginStatus = function (status)
	{
		$scope.loggedIn = status;
		cfLoggedIn = status;
		console.log("Get Login Status " + status);		
		$scope.$apply();
		setActionHandlers();
	}
});



function mainApp(user)
{
	console.log("mainApp()");
	setActionHandlers();
	if(!user)
	{
		console.log("Empty User");
		//document.getElementById("clientName").innerHTML = "";
		return;
	}
	//afterLogin();
	console.log("User.");
	console.log("try set login status");
	cf.setLoginStatus(true);
	document.getElementById("clientName").innerHTML = user.displayName;
	console.log("user.uid: " +user.uid);
	console.log("user.email: " +user.email);
	console.log("user.photoURL: " +user.photoURL);
	console.log(user);
	updateForm();
	var token = document.getElementById("token");
	firebase.auth().currentUser.getIdToken(true)
		.then(function(idToken){
			console.log("idToken: " + idToken); 
			checkUser(idToken);
			token.value = idToken;
		}).catch(function(error) {
			console.log("error getting token");
		});
}

function updateForm()
{
	console.log("updateForm()");
	var selection = document.getElementById("Selection");
	var direction = document.getElementById("Direction");
	if(selection.options[selection.selectedIndex].value=="iou")
		direction.innerHTML = "to";
	else if(selection.options[selection.selectedIndex].value=="uoi")
		direction.innerHTML = "from";
	else
		direction.innerHTML = "fooey";
}

function setActionHandlers() {
	
	if(!cfLoggedIn)
	{
		return;
	}
	else
	{
		var selection = document.getElementById("Selection");
		selection.onchange = function(){ updateForm() };
	}
}

function checkUser(idToken)
{
	console.log("index.js - checkUser");
	var data = JSON.stringify({ 
		token: idToken
	});
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			if(xhr.responseText == "true")
			{
				return;
			}
			else
			{
				location.replace("/signUp");
			}
		}
	}
	xhr.open("POST", "/checkUser", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data);
}