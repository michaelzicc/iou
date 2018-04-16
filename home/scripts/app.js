(function app() {
	// Initialize Firebase
	var config = getConfig();
	
	firebase.initializeApp(config);

	firebase.auth().onAuthStateChanged(afterLogin);
	
	function signUp()
	{
		login();
	}
	
	function login()
	{
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
		firebase.auth().useDeviceLanguage();
		firebase.auth().signInWithRedirect(provider);
	}
	
	function afterLogin(user)
	{
		console.log("authstate changed");
		updateUser();
		mainApp(user);
		// firebase.auth().getRedirectResult().then(function(result) 
		// {
			// if (result.credential) 
			// {
				// // This gives you a Google Access Token. You can use it to access the Google API.
				// var token = result.credential.accessToken;
				// // ...
			// }
			// // The signed-in user info.
			// var user = result.user;
			// console.log("Log in successful");
			// console.log(result.user);
			// updateUser(user);
		// }).catch(function(error) 
		// {
			// // Handle Errors here.
			// var errorCode = error.code;
			// var errorMessage = error.message;
			// // The email of the user's account used.
			// var email = error.email;
			// // The firebase.auth.AuthCredential type that was used.
			// var credential = error.credential;
			// // ...
		// });	
		// console.log("outside then");
	}
	
	function logOut()
	{
		firebase.auth().signOut().then(function() {
			console.log("Log out successful");
		// Sign-out successful.
		}).catch(function(error) {
					// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			// ...
		});
	}
	
	function updateUser()
	{
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/updateUser", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify(firebase.auth().currentUser));
	}
	
	function mainApp(user)
	{
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

	var loginButton = document.getElementById("LogIn");
	loginButton.onclick = function(){ login() };
	
	var signUpButton = document.getElementById("SignUp");
	signUpButton.onclick = function(){ signUp() };

	var logOutButton = document.getElementById("LogOut");
	logOutButton.onclick = function(){ logOut() };
	
	var selection = document.getElementById("Selection");
	selection.onchange = function(){ updateForm() };
}());