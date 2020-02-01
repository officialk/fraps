const app = require("express")();
app.listen(8080);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/www/index.html");
});
app.get("/provider", (req, res) => {
  res.sendFile(__dirname + "/provider/index.html");
});
app.get("/verifier", (req, res) => {
  res.sendFile(__dirname + "/verifier/index.html");
});
