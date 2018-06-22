var checkedName;

function search()
{
	console.log("search.js - search");
	var username = document.getElementById("searchField").value;
	var idToken = document.getElementById("token").value;
	console.log("username");
	console.log(username);
	if(username == null || username == undefined || username == "")
	{
		console.log("test");
		document.getElementById("searchResults").innerHTML = "Please Enter a Username";
		return;
	}
	var data = JSON.stringify({ 
		token: idToken,
		username: username
	});
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			if(xhr.status == 404 || xhr.status == 200)
			{
				document.getElementById("searchResults").innerHTML = xhr.responseText;
				checkedName = username;
			}
			else
			{
				document.getElementById("searchResults").innerHTML = "Error Occurred";
			}
		}
	}
	xhr.open("POST", "/search", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data);
}


function connect()
{
	console.log("search.js - connect");
	var username = checkedName;
	var idToken = document.getElementById("token").value;
	console.log("username");
	console.log(username);
	if(username == null || username == undefined || username == "")
	{
		console.log("test");
		document.getElementById("searchResults").innerHTML = "Please Enter a Username";
		return;
	}
	var data = JSON.stringify({ 
		token: idToken,
		username: username
	});
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			if(xhr.status == 404 || xhr.status == 200)
			{
				document.getElementById("searchResults").innerHTML = xhr.responseText;
			}
			else
			{
				document.getElementById("searchResults").innerHTML = "Error Occurred";
			}
		}
	}
	xhr.open("POST", "/connect", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data);
}