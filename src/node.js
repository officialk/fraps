const app = require("express")();
app.listen(8080);
app.get("/provider/*", (req, res) => {
  res.sendFile(__dirname + "/" + req.url);
});
app.get("/verifier/*", (req, res) => {
  res.sendFile(__dirname + "/" + req.url);
});
app.get("/api/*", (req, res) => {
  res.send("not Ready Yet");
});
app.get("/*", (req, res) => {
  console.log(req.url);
  res.sendFile(__dirname + "/www" + req.url);
});
