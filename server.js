var express = require("express");
var app = express();

app.get('/', (req, res) => {
res.sendFile(__dirname + "/index.html");
});

app.listen(8000, () => {
console.log("server started on port 8000")
});