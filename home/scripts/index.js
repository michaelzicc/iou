function mainApp(user)
{
	console.log("mainApp()");
	setActionHandlers();
	if(!user)
	{
		console.log("Empty User");
		document.getElementById("clientName").innerHTML = "";
		return;
	}
	//afterLogin();
	console.log("User.");
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
		
	var loginButton = document.getElementById("LogIn");
	loginButton.onclick = function(){ login() };

	var signUpButton = document.getElementById("SignUp");
	signUpButton.onclick = function(){ signUp() };

	var logOutButton = document.getElementById("LogOut");
	logOutButton.onclick = function(){ logOut() };

	var selection = document.getElementById("Selection");
	selection.onchange = function(){ updateForm() };
}