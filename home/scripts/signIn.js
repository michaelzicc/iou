function mainApp(user)
{
	
	console.log(user);
	console.log('signIn.js - mainApp()');
	if(user)
	{
		firebase.auth().currentUser.getIdToken(true)
			.then(function(idToken){
				console.log("idToken: " + idToken);
				checkUser(idToken);
			}).catch(function(error) {
				console.log("error getting token");
			});
		return;
	}
	login();
	return;

}//());

function checkUser(idToken)
{
	console.log("signIn.js - checkUser");
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

function login()
{
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
	firebase.auth().useDeviceLanguage();
	firebase.auth().signInWithRedirect(provider);
}