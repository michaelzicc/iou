# Setup
## config.js
A config.js file needs to be created in home/scripts/config.js with Firebase information as follows:

```
function getConfig() {
	return {
		apiKey: "",
		authDomain: "",
		databaseURL: "",
		projectId: "",
		storageBucket: "",
		messagingSenderId: ""
	};
}
```

## Firebase Admin SDK
Your Firebase Admin SDK JSON file has to be placed in the root directory.
This file can be downloaded from the Firebase website, in your project settings, under the Service Accounts tab.  Click "Generate New Private Key."

## firebaseAdmin.js
A firebaseAdmin.js file needs to be created in the root directory with Firebase information as follows:

```
var admin = require("firebase-admin");

var serviceAccount = require("./path/to/serviceAccountKey.json");
var FieldValue = admin.firestore.FieldValue;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
  logging_enabled: true
});

module.exports = {
	admin,
	serviceAccount,
	FieldValue
}
```

## Google Authentication
Google Authentication for your project needs to be enabled on the Firebase website.

## Firestore
Firestore needs to be setup on the Firebase website with appropriate rules.
