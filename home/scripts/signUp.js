function mainApp(user)
{
	console.log("signup.js mainApp()");
	if(!user)
	{
		login();
		console.log("Empty User");
		return;
	}
	var token = document.getElementById("token");
	firebase.auth().currentUser.getIdToken(true)
		.then(function(idToken){
			console.log("idToken: " + idToken); 
			token.value = idToken;
			checkUser(idToken);
		}).catch(function(error) {
			console.log("error getting token");
		});
}


function checkUser(idToken)
{
	var data = JSON.stringify({ 
		token: idToken
	});
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			if(xhr.responseText == "true")
			{
				location.replace("/");
			}
		}
	}
	xhr.open("POST", "/checkUser", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data);
}

function submitForm()
{
	var formData = new FormData( document.getElementById("CreateUsernameForm") );
	
	var object = {};
	formData.forEach(function(value, key){
		object[key] = value;
	});
	var json = JSON.stringify(object);
	
	console.log(json);
	
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			if(xhr.status == 400)
			{
				document.getElementById("errorMessage").innerHTML = xhr.responseText;
			}
			else
			{
				location.replace(xhr.responseURL);
			}
		}
	}
	xhr.open("POST", "/newAccount", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(json);
	return false;
}